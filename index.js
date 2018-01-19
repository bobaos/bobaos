const ObjectServerProtocol = require('./ObjectServer/ObjectServerProtocol');
const SerialPort = require('serialport');
const FT12Parser = require('./FT12/FT12Parser');
const FT12FrameHelper = require('./FT12/FT12FrameHelper');

const EventEmitter = require('events').EventEmitter;


// constants
const FIXED_FRAME_LENGTH = 4;
const ACK_FRAME = Buffer.from([0xE5]);
const RESET_REQ = Buffer.from([0x10, 0x40, 0x40, 0x16]);
const RESET_IND = Buffer.from([0x10, 0xC0, 0xC0, 0x16]);


class Baos extends EventEmitter {
  constructor(props) {
    super(props);
    this.debug = Object.prototype.hasOwnProperty.call(props, 'debug') ? props.debug : true;
    // default settings for serial port
    let serialPortDevice = '/dev/ttyAMA0';
    let serialPortParams = {
      baudRate: 19200,
      parity: "even",
      dataBits: 8,
      stopBits: 1
    };
    // assign settings from parameters
    if (props.serialPort !== null && typeof props.serialPort === 'object') {
      if (props.serialPort.device !== null && typeof props.serialPort.device === 'string') {
        serialPortDevice = props.serialPort.device;
      }
      if (props.serialPort.params !== null && typeof props.serialPort.params === 'object') {
        serialPortParams = props.serialPort.params;
      }
    }
    // open port
    this._serialPort = new SerialPort(serialPortDevice, serialPortParams);
    const parser = new FT12Parser();
    this._serialPort.pipe(parser);

    // this._ft12
    this._ft12_vars = {
      resetAckReceived: false,
      resetIntervalID: null,
      resetIntervalCount: 0,
      ackReceived: false,
      responseReceived: false,
      lastRequest: null,
      lastResponse: null,
      frameCount: 'odd'
    };
    this._ft12_consts = {
      resetIntervalTime: 1000,
      resetIntervalMaxCount: 3,
      ackTimeoutTime: 500,
    };
    // queue
    this._queue = [];
    // process data returned by parser
    parser.on('data', this._ft12_processIncomingData.bind(this));
    // sending reset request at communication start
    this._serialPort.on('open', () => {
      this.log("baos constructor: serial port opened, sending reset request [0]");
      this._ft12_sendResetRequest();
      this._ft12_vars.resetIntervalID = setInterval(() => {
        const resetAckReceived = this._ft12_vars.resetAckReceived;
        const resetIntervalCount = this._ft12_vars.resetIntervalCount;
        const resetIntervalMaxCount = this._ft12_consts.resetIntervalMaxCount;
        if (!resetAckReceived && resetIntervalCount < resetIntervalMaxCount) {
          this._ft12_vars.resetIntervalCount += 1;
          this.log(`baos constructor: sending reset request[${resetIntervalCount + 1}]`);
          this._ft12_sendResetRequest();
        }
        if (!resetAckReceived && resetIntervalCount >= resetIntervalMaxCount) {
          this.log("closing serial port");
          this._serialPort.close((err) => {
            if (err) {
              throw new Error("error while closing port: " + err);
            }
            this._ft12_vars.resetIntervalCount = 0;
            clearInterval(this._ft12_vars.resetIntervalID);
            this.log("opening serialport");
            this._serialPort.open();
          })
        }
      }, this._ft12_consts.resetIntervalTime);
    })
    ;
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
    // TODO: ackReceived to true
    // TODO: if
    this.log('_ft12_processAckFrame', data);
    if (this._ft12_vars.resetAckReceived) {
      // process data frame ack
      this._ft12_vars.ackReceived = true;
      this.log('_ft12_processAckFrame: ack received for data frame');
      // waiting for response
    } else {
      // process resetAck
      this._ft12_vars.frameCount = 'odd';
      this._ft12_vars.resetAckReceived = true;
      this._ft12_vars.ackReceived = true;
      this._ft12_vars.responseReceived = true;
      this.log('_ft12_processAckFrame: got acknowledge for reset request!', this._ft12_vars);
      this.emit('open');
    }
  }

  _ft12_processResetInd(data) {
    // TODO: reset frame count
    // TODO: emit event 'reset'
    this._ft12_vars.frameCount = 'odd';
    this._ft12_vars.resetAckReceived = true;
    this._ft12_vars.ackReceived = true;
    this._ft12_vars.responseReceived = true;
    this.log('_ft12_processResetInd: got reset ind!');
    // send acknowledge
    this._ft12_sendAck();
    this.emit('reset');
  }

  _ft12_processDataFrame(data) {
    // DONE: get help from FT12Helper
    // DONE: parse message, get service. if direction === 'response' then set resReceived flag to true, queue_next()
    // DONE: emit event 'service'
    this.log("_ft12_processDataFrame:", data);
    if (data.length <= FIXED_FRAME_LENGTH) {
      throw new RangeError(`_ft12_processDataFrame: expected length > ${FIXED_FRAME_LENGTH} but got ${data.length}`);
    }
    // send acknowledge to Baos in any case
    this._ft12_sendAck();
    // this.emit('_ft12.dataFrame', message);
    // DONE: parse
    try {
      const message = FT12FrameHelper.processFrame(data);
      const service = ObjectServerProtocol.processIncomingMessage(message);
      switch (service.direction) {
        case 'indication':
          this.log('_ft12_processDataFrame: got service with direction: ind');
          this.emit('service', service);
          break;
        case 'response':
          this.log('_ft12_processDataFrame: got service with direction: res');
          this.emit('service', service);
          // DONE: set response to true
          this._ft12_vars.responseReceived = true;
          this._ft12_vars.lastResponse = service;
          this._switchFrameCount();
          // TODO: queue next
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
    // TODO; get help from FT12Helper
    try {
      let frame = FT12FrameHelper.composeFrame(data, this._ft12_vars.frameCount);
      this.log('_ft12_sendDataFrame', frame);
      this._ft12_vars.lastRequest = frame.slice();
      this._ft12_vars.ackReceived = false;
      this._ft12_vars.responseReceived = false;
      this._serialPort.write(frame);
    } catch (e) {
      this.log(e);
    }
  }

  // queue
  // TODO: queue methods, send, next, etc, onAckTimeout
  _queueNext() {
    this.log('_queue_next', this._queue.length);
    if (this._queue.length > 0) {
      if (this._ft12_vars.ackReceived && this._ft12_vars.responseReceived) {
        let data = this._queue[0];
        this.log('_queue_next send data', data);
        this._ft12_sendDataFrame(data);
      } else {
        this.log('_queue_next ack not received, res not received', this._queue.length);
      }
    } else {
      this.log('_queue_next: empty queue');
    }
  }

  _queueAdd(data) {
    // TODO: ackReceived, resReceived checks
    if (this._queue.length === 0) {
      // if no messages in queue then we send it immediately
      this._queue.push(data);
      this._queueNext();
    } else {
      this._queue.push(data);
    }
  }

  // frame count
  _switchFrameCount() {
    this._ft12_vars.frameCount = this._ft12_vars.frameCount === 'odd' ? 'even' : 'odd';
  }

  // public datapoint methods
  // TODO: datapoint methods
  getDatapointDescription(id, number = 1) {
    if (typeof id === "undefined") {
      throw new Error("Please specify datapoint id");
    }
    try {
      const data = ObjectServerProtocol.GetDatapointDescriptionReq({
        start: id,
        number: number
      });
      this._queueAdd(data);
    } catch (e) {
      console.log(e);
    }
    return this;
  }

  setDatapointValue(id, value) {
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
        payload: [
          {id: id, value: value, command: 'set and send'}
        ]
      });
      this._queueAdd(data);
    } catch (e) {
      console.log(e);
    }
    return this;
  }

  readDatapointFromBus(id, length) {
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
        payload: [
          {id: id, value: value, command: "read via bus", length: length}
        ]
      });
      this._queueAdd(data);
    } catch (e) {
      console.log(e);
    }
    return this;
  }

  getDatapointValue(id, number = 1) {
    if (typeof id === "undefined") {
      throw new Error("Please specify datapoint id");
    }
    try {
      const data = ObjectServerProtocol.GetDatapointValueReq({
        start: id,
        number: number
      });
      this._queueAdd(data);
    } catch (e) {
      console.log(e);
    }
    return this;

  }

  getParameterByte(id, number = 1) {
    if (typeof id === "undefined") {
      throw new Error("Please specify datapoint id");
    }
    try {
      const data = ObjectServerProtocol.GetParameterByteReq({
        start: id,
        number: number
      });
      this._queueAdd(data);
    } catch (e) {
      console.log(e);
    }
    return this;
  }

  // log
  log(...
        args) {
    if (

      this
        .debug
    ) {
      console
        .log(
          'Baos:'
          ,
          args
        )
      ;
    }
  }
}

module.exports = Baos;
