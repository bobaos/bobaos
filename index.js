const ObjectServerProtocol = require("./ObjectServer/ObjectServerProtocol");
const SerialPort = require("serialport");
const FT12Parser = require("./FT12/FT12Parser");
const FT12FrameHelper = require("./FT12/FT12FrameHelper");

const EventEmitter = require("events").EventEmitter;

// constants
const FIXED_FRAME_LENGTH = 4;
const ACK_FRAME = Buffer.from([0xe5]);
const RESET_REQ = Buffer.from([0x10, 0x40, 0x40, 0x16]);
const RESET_IND = Buffer.from([0x10, 0xc0, 0xc0, 0x16]);

class Baos extends EventEmitter {
  constructor(props) {
    super(props);
    this.debug = Object.prototype.hasOwnProperty.call(props, "debug") ? props.debug : false;
    this._ft12_consts = {
      resetIntervalTime: 1000,
      resetIntervalMaxCount: 3,
      responseTimeoutTime: 1000
    };
    // default settings for serial port
    this._serialPortDevice = "/dev/ttyAMA0";
    this._serialPortParams = {
      baudRate: 19200,
      parity: "even",
      dataBits: 8,
      stopBits: 1
    };
    // assign settings from parameters
    if (typeof props.serialPort === "object") {
      if (typeof props.serialPort.device === "string") {
        this._serialPortDevice = props.serialPort.device;
      }
      if (typeof props.serialPort.params === "object") {
        Object.assign(this._serialPortParams, props.serialPort.params);
      }
    }
    this.openSerialPort();
    // due to 'serialport' bug use hacking
    // https://github.com/node-serialport/node-serialport/issues/1751
    // TODO: update as bug will be solved
    setInterval(_ => {}, 0);
  }

  // FT12 process data
  _ft12_processIncomingData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error(`_ft12_processIncomingData: data expected to be buffer but got ${typeof data}`);
    }
    this.log("_ft12_processIncomingData", data);
    if (data.length <= FIXED_FRAME_LENGTH) {
      if (data.compare(ACK_FRAME) === 0) {
        this._ft12_processAckFrame(data);
      } else if (data.compare(RESET_IND) === 0) {
        this._ft12_processResetInd(data);
      }
    } else {
      this._ft12_processDataFrame(data);
    }
  }

  _ft12_processAckFrame(data) {
    this.log("_ft12_processAckFrame", data);
    if (this._ft12_vars.resetAckReceived) {
      // process data frame ack
      this._ft12_vars.ackReceived = true;
      this.log("_ft12_processAckFrame: ack received for data frame");
      // waiting for response
    } else {
      // process resetAck
      this._ft12_vars.frameCount = "odd";
      this._ft12_vars.resetAckReceived = true;
      this._ft12_vars.ackReceived = true;
      this._ft12_vars.responseReceived = true;
      this.log("_ft12_processAckFrame: got acknowledge for reset request!", this._ft12_vars);
      this.emit("open");
    }
  }

  _ft12_processResetInd(data) {
    // reset frame count
    this._ft12_vars.frameCount = "odd";
    this._ft12_vars.resetAckReceived = true;
    this._ft12_vars.ackReceived = true;
    this._ft12_vars.responseReceived = true;
    this.log("_ft12_processResetInd: got reset ind!");
    // send acknowledge
    this._ft12_sendAck();
    // clear queue
    this._queue = [];
    // emit event 'reset'
    this.emit("reset");
  }

  _ft12_processDataFrame(data) {
    // parse message, get service. if direction === 'response' then set resReceived flag to true, queue_next()
    this.log("_ft12_processDataFrame:", data);
    if (data.length <= FIXED_FRAME_LENGTH) {
      throw new RangeError(`_ft12_processDataFrame: expected length > ${FIXED_FRAME_LENGTH} but got ${data.length}`);
    }
    // send acknowledge to BAOS in any case
    this._ft12_sendAck();
    try {
      const message = FT12FrameHelper.processFrame(data);
      const service = ObjectServerProtocol.processIncomingMessage(message);
      switch (service.direction) {
        case "indication":
          this.log("_ft12_processDataFrame: got service with direction: ind");
          switch (service.service) {
            case "DatapointValue.Ind":
              this.emit("DatapointValue.Ind", service.payload);
              break;
            case "ServerItem.Ind":
              this.emit("ServerItem.Ind", service.payload);
              break;
            default:
              break;
          }
          break;
        case "response":
          this.log("_ft12_processDataFrame: got service with direction: res");
          // in any case emit 'service' event
          // callback
          if (!service.error) {
            // resolve last req promise
            if (typeof this._resolveLastReq === "function") {
              if (service.hasOwnProperty("payload")) {
                this._resolveLastReq(service.payload);
              } else {
                this._resolveLastReq();
              }
            }
          } else {
            if (typeof this._rejectLastReq === "function") {
              // if we got error from baos then reject last req promise with error description
              if (service.hasOwnProperty("payload")) {
                this._rejectLastReq(
                  new Error(`Code: ${service.payload.code}, description: ${service.payload.description}`)
                );
              } else {
                this._rejectLastReq(new Error("Unknown error"));
              }
            }
          }
          // in case if somehow we didn't receive acknowledge frame but got response we set it's flag to true
          this._ft12_vars.ackReceived = true;
          this._ft12_vars.responseReceived = true;
          this._ft12_vars.lastResponse = service;
          this._ft12_switchFrameCount();
          // clear timeout which we set in _ft12_sendDataFrame method
          clearTimeout(this._ft12_vars.responseTimeoutID);
          // delete item from queue and proceed to next
          this._queue.shift();
          this._queueNext();
          break;
        default:
          break;
      }
    } catch (e) {
      this.log(e);
    }
  }

  // FT12 Requests
  _ft12_sendResetRequest() {
    this._serialPort.write(RESET_REQ);
  }

  _ft12_sendAck() {
    this._serialPort.write(ACK_FRAME);
  }

  _ft12_sendDataFrame(data) {
    try {
      let frame = FT12FrameHelper.composeFrame(data, this._ft12_vars.frameCount);
      this.log("_ft12_sendDataFrame:", frame);
      this._ft12_vars.lastRequest = frame.slice();
      this._ft12_vars.ackReceived = false;
      this._ft12_vars.responseReceived = false;
      this._serialPort.write(frame);
      // now, we send data and wait for response. Incoming data frame with response direction
      // will clear this interval, otherwise, it will be sent with different frame count.
      this._ft12_vars.responseTimeoutID = setTimeout(_ => {
        this.log("_ft12_sendDataFrame: response timeout, send data again with different frame count");
        this._ft12_switchFrameCount();
        this._ft12_sendDataFrame(data);
      }, this._ft12_consts.responseTimeoutTime);
    } catch (e) {
      this.log(e);
    }
  }

  // queue
  _queueNext() {
    this.log("_queue_next", this._queue.length);
    if (this._queue.length > 0) {
      if (this._ft12_vars.ackReceived && this._ft12_vars.responseReceived) {
        let item = this._queue[0];
        let data = item.data;
        this._resolveLastReq = item.resolve;
        this._rejectLastReq = item.reject;
        this.log("_queue_next send data", data);
        this._ft12_sendDataFrame(data);
      } else {
        this.log("_queue_next ack not received, res not received", this._queue.length);
      }
    } else {
      this.log("_queue_next: empty queue");
    }
  }

  _queueAdd(data) {
    if (this._queue.length === 0) {
      // if no messages in queue then we send it immediately
      this._queue.push(data);
      this._queueNext();
    } else {
      this._queue.push(data);
    }
  }

  // frame count
  _ft12_switchFrameCount() {
    this._ft12_vars.frameCount = this._ft12_vars.frameCount === "odd" ? "even" : "odd";
  }

  //
  openSerialPort() {
    // init vars
    // vars to resolve/reject last request promise
    this._resolveLastReq = null;
    this._rejectLastReq = null;
    // this._ft12
    this._ft12_vars = {
      resetAckReceived: false,
      resetIntervalID: null,
      responseTimeoutID: null,
      resetIntervalCount: 0,
      ackReceived: false,
      responseReceived: false,
      lastRequest: null,
      lastResponse: null,
      frameCount: "odd"
    };
    // empty queue
    this._queue = [];
    // open port
    this._serialPort = new SerialPort(this._serialPortDevice, this._serialPortParams);
    this._parser = new FT12Parser();
    this._serialPort.pipe(this._parser);

    // process data returned by parser
    this._parser.on("data", this._ft12_processIncomingData.bind(this));
    this._serialPort.on("error", err => {
      this.emit("error", err);
    });
    // sending reset request at communication start
    this._serialPort.on("open", () => {
      this.log("serial port opened, sending reset request [0]");
      this._ft12_sendResetRequest();
      this._ft12_vars.resetIntervalID = setInterval(() => {
        const resetAckReceived = this._ft12_vars.resetAckReceived;
        const resetIntervalCount = this._ft12_vars.resetIntervalCount;
        const resetIntervalMaxCount = this._ft12_consts.resetIntervalMaxCount;
        if (!resetAckReceived && resetIntervalCount < resetIntervalMaxCount) {
          this._ft12_vars.resetIntervalCount += 1;
          this.log(`sending reset request[${resetIntervalCount + 1}]`);
          this._ft12_sendResetRequest();
        }
        if (!resetAckReceived && resetIntervalCount >= resetIntervalMaxCount) {
          this.log("ack is not received for reset req. closing serial port");
          this.closeSerialPort(err => {
            if (err) {
              throw new Error("error while closing port: " + err);
            }
            this._ft12_vars.resetIntervalCount = 0;
            clearInterval(this._ft12_vars.resetIntervalID);
            this.log("trying to open serialport again");
            setTimeout(_ => {
              this.openSerialPort();
            }, this._ft12_consts.resetIntervalTime);
          });
        }
      }, this._ft12_consts.resetIntervalTime);
    });
  }

  closeSerialPort(cb) {
    this._ft12_vars.resetIntervalCount = 0;
    clearInterval(this._ft12_vars.resetIntervalID);
    this._parser.removeAllListeners("data");
    this._serialPort.removeAllListeners("open");
    this._queue = [];
    this._ft12_vars.resetAckReceived = false;

    // clear timeout for data that is sent again and again
    // so, to be sure no excess data will be send to uart
    clearTimeout(this._ft12_vars.responseTimeoutID);

    this._serialPort.close(
      typeof cb === "function"
        ? cb
        : err => {
            if (err) {
              throw new Error("error while closing port: " + err);
            }
          }
    );
  }

  // public datapoint methods
  getDatapointDescription(id, number = 1) {
    return new Promise((resolve, reject) => {
      if (typeof id === "undefined") {
        throw new Error("Please specify datapoint id");
      }
      try {
        const data = ObjectServerProtocol.GetDatapointDescriptionReq({
          start: id,
          number: number
        });
        const item = { data: data, resolve: resolve, reject: reject };
        this._queueAdd(item);
      } catch (e) {
        reject(e);
      }
    });
  }
  
  getDescriptionString(id, number = 1) {
    return new Promise((resolve, reject) => {
      if (typeof id === "undefined") {
        throw new Error("Please specify datapoint id");
      }
      try {
        const data = ObjectServerProtocol.GetDescriptionStringReq({
          start: id,
          number: number
        });
        const item = { data: data, resolve: resolve, reject: reject };
        this._queueAdd(item);
      } catch (e) {
        reject(e);
      }
    });
  }

  getServerItem(id, number = 1) {
    return new Promise((resolve, reject) => {
      if (typeof id === "undefined") {
        throw new Error("Please specify item id");
      }
      try {
        const data = ObjectServerProtocol.GetServerItemReq({
          start: id,
          number: number
        });
        const item = { data: data, resolve: resolve, reject: reject };
        this._queueAdd(item);
      } catch (e) {
        reject(e);
      }
    });
  }

  setServerItem(id, value) {
    return new Promise((resolve, reject) => {
      if (typeof id === "undefined") {
        throw new Error("Please specify item id");
      }
      if (typeof value === "undefined") {
        throw new Error("Please specify item value");
      }
      try {
        const data = ObjectServerProtocol.SetServerItemReq({
          start: id,
          number: 1,
          payload: [{ id: id, value: value }]
        });
        const item = { data: data, resolve: resolve, reject: reject };
        this._queueAdd(item);
      } catch (e) {
        reject(e);
      }
    });
  }

  setDatapointValue(id, value) {
    return new Promise((resolve, reject) => {
      if (typeof id === "undefined") {
        throw new Error("Please specify datapoint id");
      }
      if (!Buffer.isBuffer(value)) {
        throw new TypeError("Please specify value as buffer");
      }
      try {
        const data = ObjectServerProtocol.SetDatapointValueReq({
          start: id,
          number: 1,
          payload: [{ id: id, value: value, command: "set and send" }]
        });
        const item = { data: data, resolve: resolve, reject: reject };
        this._queueAdd(item);
      } catch (e) {
        reject(e);
      }
    });
  }

  setMultipleValues(values) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(values)) {
        throw new Error("Please specify values as an Array of objects {id: id, value: value}");
      }
      if (values.length < 1) {
        throw new Error("Values array shoudn't be empty");
      }
      try {
        let start = values[0].id;
        let number = values.length;
        let payload = values.map(t => {
          if (typeof t.id === "undefined") {
            throw new Error("Please specify datapoint id");
          }
          if (!Buffer.isBuffer(t.value)) {
            throw new TypeError("Item value should be Buffer.");
          }
          return { id: t.id, value: t.value, command: "set and send" };
        });
        const data = ObjectServerProtocol.SetDatapointValueReq({
          start: start,
          number: number,
          payload: payload
        });
        const item = { data: data, resolve: resolve, reject: reject };
        this._queueAdd(item);
      } catch (e) {
        reject(e);
      }
    });
  }

  readDatapointFromBus(id, length) {
    return new Promise((resolve, reject) => {
      if (typeof id === "undefined") {
        throw new Error("Please specify datapoint id");
      }
      if (typeof length === "undefined") {
        throw new Error("Please specify datapoint value length in bytes");
      }
      try {
        let value = Buffer.alloc(length, 0x00);
        const data = ObjectServerProtocol.SetDatapointValueReq({
          start: id,
          number: 1,
          payload: [{ id: id, value: value, command: "read via bus", length: length }]
        });
        const item = { data: data, resolve: resolve, reject: reject };
        this._queueAdd(item);
      } catch (e) {
        reject(e);
      }
    });
  }

  readMultipleDatapoints(datapoints) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(datapoints)) {
        throw new Error("Please specify datapoints as an Array of objects {id: id, length: length}");
      }
      if (datapoints.length < 1) {
        throw new Error("Datapoints array shoudn't be empty");
      }
      try {
        let start = datapoints[0].id;
        let number = datapoints.length;
        let payload = datapoints.map(t => {
          if (typeof t.id === "undefined") {
            throw new Error("Please specify datapoint id");
          }
          if (typeof t.length === "undefined") {
            throw new Error("Please specify datapoint value length in bytes");
          }
          let value = Buffer.alloc(t.length, 0x00);
          return { id: t.id, value: value, command: "read via bus" };
        });
        const data = ObjectServerProtocol.SetDatapointValueReq({
          start: start,
          number: number,
          payload: payload
        });
        const item = { data: data, resolve: resolve, reject: reject };
        this._queueAdd(item);
      } catch (e) {
        reject(e);
      }
    });
  }

  getDatapointValue(id, number = 1, filter = 0x00) {
    return new Promise((resolve, reject) => {
      if (typeof id === "undefined") {
        throw new Error("Please specify datapoint id");
      }
      try {
        const data = ObjectServerProtocol.GetDatapointValueReq({
          start: id,
          number: number,
          filter: filter
        });
        const item = { data: data, resolve: resolve, reject: reject };
        this._queueAdd(item);
      } catch (e) {
        reject(e);
      }
    });
  }

  getParameterByte(id, number = 1) {
    return new Promise((resolve, reject) => {
      if (typeof id === "undefined") {
        throw new Error("Please specify datapoint id");
      }
      try {
        const data = ObjectServerProtocol.GetParameterByteReq({
          start: id,
          number: number
        });
        const item = { data: data, resolve: resolve, reject: reject };
        this._queueAdd(item);
      } catch (e) {
        reject(e);
      }
    });
  }

  // log
  log(...args) {
    if (this.debug) {
      console.log("bobaos:", args);
    }
  }
}

module.exports = Baos;
