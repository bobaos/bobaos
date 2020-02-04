"use strict";

/**
 * Class with static methods to compose/parse messages
 */
const Services = require("./ObjectServerServices");
const Errors = require("./ObjectServerErrors");

class ObjectServerProtocol {
  static GetDatapointValueReq(params) {
    if (params !== null && typeof params === "object") {
      if (!Object.prototype.hasOwnProperty.call(params, "start")) {
        throw new Error("Please specify datapoint start number");
      }
      let start = params.start;
      let number = 1;
      if (Object.prototype.hasOwnProperty.call(params, "number")) {
        number = params.number;
      }
      // 0x00 - all, 0x01 - valid, 0x02 - updated, 0x03..0xFF - reserved
      let filter = 0x00;
      if (Object.prototype.hasOwnProperty.call(params, "filter")) {
        filter = params.filter;
      }
      const serviceName = "GetDatapointValue.Req";
      // const findServiceByName = service => service.name === serviceName;
      let service = this._findServiceByName(serviceName);
      if (service !== null && typeof service === "object") {
        let main = service.main;
        let sub = service.sub;
        let servicePart = Buffer.from([main, sub]);
        // +0 start, +2 number, +4 filter
        let dpPart = Buffer.alloc(5);
        dpPart.writeUInt16BE(start, 0);
        dpPart.writeUInt16BE(number, 2);
        dpPart.writeUInt8(filter, 4);

        return Buffer.concat([servicePart, dpPart]);
      } else {
        throw new RangeError(`Service ${serviceName} not found`);
      }
    } else {
      throw new TypeError("Please specify parameters as object {start: Int, number: Int}");
    }
  }

  static GetParameterByteReq(params) {
    if (params !== null && typeof params === "object") {
      if (!Object.prototype.hasOwnProperty.call(params, "start")) {
        throw new Error("Please specify datapoint start number");
      }
      let start = params.start;
      let number = 1;
      if (Object.prototype.hasOwnProperty.call(params, "number")) {
        number = params.number;
      }
      const serviceName = "GetParameterByte.Req";
      // const findServiceByName = service => service.name === serviceName;
      // let service = Services.find(findServiceByName);
      let service = this._findServiceByName(serviceName);
      if (service !== null && typeof service === "object") {
        let main = service.main;
        let sub = service.sub;
        let servicePart = Buffer.from([main, sub]);
        let dpPart = Buffer.alloc(4);
        dpPart.writeUInt16BE(start, 0);
        dpPart.writeUInt16BE(number, 2);
        return Buffer.concat([servicePart, dpPart]);
      } else {
        throw new RangeError(`Service ${serviceName} not found`);
      }
    } else {
      throw new TypeError("Please specify parameters as object {start: Int, number: Int}");
    }
  }

  static GetDatapointDescriptionReq(params) {
    if (params !== null && typeof params === "object") {
      if (!Object.prototype.hasOwnProperty.call(params, "start")) {
        throw new Error("Please specify datapoint start number");
      }
      let start = params.start;
      let number = 1;
      if (Object.prototype.hasOwnProperty.call(params, "number")) {
        number = params.number;
      }
      const serviceName = "GetDatapointDescription.Req";
      // const findServiceByName = service => service.name === serviceName;
      // let service = Services.find(findServiceByName);
      let service = this._findServiceByName(serviceName);
      if (service !== null && typeof service === "object") {
        let main = service.main;
        let sub = service.sub;
        let servicePart = Buffer.from([main, sub]);
        let dpPart = Buffer.alloc(4);
        dpPart.writeUInt16BE(start, 0);
        dpPart.writeUInt16BE(number, 2);
        return Buffer.concat([servicePart, dpPart]);
      } else {
        throw new RangeError(`Service ${serviceName} not found`);
      }
    } else {
      throw new TypeError("Please specify parameters as object {start: Int, number: Int}");
    }
  }
  
  static GetDescriptionStringReq(params) {
    if (params !== null && typeof params === "object") {
      if (!Object.prototype.hasOwnProperty.call(params, "start")) {
        throw new Error("Please specify datapoint start number");
      }
      let start = params.start;
      let number = 1;
      if (Object.prototype.hasOwnProperty.call(params, "number")) {
        number = params.number;
      }
      const serviceName = "GetDescriptionString.Req";
      // const findServiceByName = service => service.name === serviceName;
      // let service = Services.find(findServiceByName);
      let service = this._findServiceByName(serviceName);
      if (service !== null && typeof service === "object") {
        let main = service.main;
        let sub = service.sub;
        let servicePart = Buffer.from([main, sub]);
        let dpPart = Buffer.alloc(4);
        dpPart.writeUInt16BE(start, 0);
        dpPart.writeUInt16BE(number, 2);
        return Buffer.concat([servicePart, dpPart]);
      } else {
        throw new RangeError(`Service ${serviceName} not found`);
      }
    } else {
      throw new TypeError("Please specify parameters as object {start: Int, number: Int}");
    }
  }

  static GetServerItemReq(params) {
    if (params !== null && typeof params === "object") {
      if (!Object.prototype.hasOwnProperty.call(params, "start")) {
        throw new Error("Please specify item start number");
      }
      let start = params.start;
      let number = 1;
      if (Object.prototype.hasOwnProperty.call(params, "number")) {
        number = params.number;
      }
      const serviceName = "GetServerItem.Req";
      // const findServiceByName = service => service.name === serviceName;
      // let service = Services.find(findServiceByName);
      let service = this._findServiceByName(serviceName);
      if (service !== null && typeof service === "object") {
        let main = service.main;
        let sub = service.sub;
        let servicePart = Buffer.from([main, sub]);
        let dpPart = Buffer.alloc(4);
        dpPart.writeUInt16BE(start, 0);
        dpPart.writeUInt16BE(number, 2);
        return Buffer.concat([servicePart, dpPart]);
      } else {
        throw new RangeError(`Service ${serviceName} not found`);
      }
    } else {
      throw new TypeError("Please specify parameters as object {start: Int, number: Int}");
    }
  }

  static SetServerItemReq(params) {
    if (params !== null && typeof params === "object") {
      if (!Object.prototype.hasOwnProperty.call(params, "start")) {
        throw new Error("Please specify item start number");
      }
      let start = params.start;
      let number = 1;
      if (Object.prototype.hasOwnProperty.call(params, "number")) {
        number = params.number;
      }
      // payload
      if (!Object.prototype.hasOwnProperty.call(params, "payload")) {
        throw new Error("Please specify payload");
      }
      let payload = params.payload;
      if (!Array.isArray(payload)) {
        throw new TypeError("Please specify payload as array");
      }
      const processPayloadItem = item => {
        // {id[2], length[1], data[n]}
        let res = Buffer.alloc(0);
        if (item !== null && typeof item === "object") {
          if (!Object.prototype.hasOwnProperty.call(item, "id")) {
            throw new Error("Please specify item id");
          }
          let id = item.id;
          let idBuff = Buffer.alloc(2);
          idBuff.writeUInt16BE(id);
          if (!Object.prototype.hasOwnProperty.call(item, "value")) {
            throw new Error("Please specify item value");
          }
          let value = item.value;
          if (!Buffer.isBuffer(value)) {
            throw new Error(`Expected value to be Buffer but got ${typeof value}`);
          }
          let length = value.length;
          let lengthBuff = Buffer.alloc(1, length & 0xff);
          res = Buffer.concat([idBuff, lengthBuff, value]);
          return res;
        }
      };

      const serviceName = "SetServerItem.Req";
      // const findServiceByName = service => service.name === serviceName;
      // let service = Services.find(findServiceByName);
      let service = this._findServiceByName(serviceName);
      if (service !== null && typeof service === "object") {
        let main = service.main;
        let sub = service.sub;
        let servicePart = Buffer.from([main, sub]);
        let dpPart = Buffer.alloc(4);
        dpPart.writeUInt16BE(start, 0);
        dpPart.writeUInt16BE(number, 2);
        let payloadPart = Buffer.concat(payload.map(processPayloadItem));
        return Buffer.concat([servicePart, dpPart, payloadPart]);
      } else {
        throw new RangeError(`Service ${serviceName} not found`);
      }
    } else {
      throw new TypeError("Please specify parameters as object {start: Int, number: Int}");
    }
  }

  static SetDatapointValueReq(params) {
    if (params !== null && typeof params === "object") {
      // start
      if (!Object.prototype.hasOwnProperty.call(params, "start")) {
        throw new Error("Please specify datapoint start number");
      }
      let start = params.start;

      // number
      let number = 1;
      if (Object.prototype.hasOwnProperty.call(params, "number")) {
        number = params.number;
      }

      // payload
      if (!Object.prototype.hasOwnProperty.call(params, "payload")) {
        throw new Error("Please specify payload");
      }
      let payload = params.payload;
      if (!Array.isArray(payload)) {
        throw new TypeError("Please specify payload as array");
      }
      const processPayloadItem = item => {
        let res = Buffer.alloc(0);
        if (item !== null && typeof item === "object") {
          if (!Object.prototype.hasOwnProperty.call(item, "id")) {
            throw new Error("Please specify item id");
          }
          let id = item.id;
          let idBuff = Buffer.alloc(2);
          idBuff.writeUInt16BE(id);

          // now going commands
          // by default let it be 'set and send'
          const commands = [
            { name: "no command", value: 0x00, itemValueRequired: false },
            { name: "set value", value: 0x01, itemValueRequired: true },
            { name: "send on bus", value: 0x02, itemValueRequired: false },
            { name: "set and send", value: 0x03, itemValueRequired: true },
            { name: "read via bus", value: 0x04, itemValueRequired: true },
            { name: "clear transmission state", value: 0x05, itemValueRequired: false }
          ];
          let commandBuff;
          let commandName = "set and send";
          if (Object.prototype.hasOwnProperty.call(item, "command")) {
            commandName = item.command;
          }
          const findCommandByName = t => t.name === commandName;
          let command = commands.find(findCommandByName);
          if (command !== null && typeof command === "object") {
            commandBuff = Buffer.alloc(1, command.value & 0x0f);
            let lengthBuff = Buffer.alloc(1, 0x00);
            let valueBuff = Buffer.alloc(1, 0x00);

            // now let check if item value is required by command
            if (command.itemValueRequired) {
              if (Object.prototype.hasOwnProperty.call(item, "value")) {
                if (Buffer.isBuffer(item.value)) {
                  valueBuff = item.value;
                } else {
                  throw new TypeError("Value should be buffer!");
                }
                // now specify length if defined, else calculate
                if (Object.prototype.hasOwnProperty.call(item, "length")) {
                  lengthBuff = Buffer.alloc(1, item.length & 0xff);
                } else {
                  lengthBuff = Buffer.alloc(1, valueBuff.length & 0xff);
                }
              } else {
                throw new Error("Please specify value in payload");
              }
            }
            res = Buffer.concat([idBuff, commandBuff, lengthBuff, valueBuff]);
            return res;
          } else {
            throw new RangeError(`Please specify command as one of the following: [${commands.map(t => t.name)}]`);
          }
        } else {
          throw new TypeError("Please specify item as object");
        }
      };
      const serviceName = "SetDatapointValue.Req";
      // const findServiceByName = service => service.name === serviceName;
      // let service = Services.find(findServiceByName);
      let service = this._findServiceByName(serviceName);
      if (service !== null && typeof service === "object") {
        let main = service.main;
        let sub = service.sub;
        let servicePart = Buffer.from([main, sub]);
        let dpPart = Buffer.alloc(4);
        dpPart.writeUInt16BE(start, 0);
        dpPart.writeUInt16BE(number, 2);
        let payloadPart = Buffer.concat(payload.map(processPayloadItem));
        return Buffer.concat([servicePart, dpPart, payloadPart]);
      } else {
        throw new RangeError(`Service ${serviceName} not found`);
      }
    } else {
      throw new TypeError("Please specify parameters as object {start: Int, number: Int}");
    }
  }

  static _processDatapointValuePayload(data) {
    const processStateByte = code => {
      const transmissionStatusList = [
        { code: 0, status: "Idle/OK" },
        { code: 1, status: "Idle/Error" },
        { code: 2, status: "Transmission in progress" },
        { code: 3, status: "Transmission request" }
      ];
      const transmissionStatusCode = code & 0x03;
      const transmissionStatus = transmissionStatusList.find(t => t.code === transmissionStatusCode).status;
      const readRequestFlag = !!(code & 0x04);
      const updateFlag = !!(code & 0x08);
      const validFlag = !!(code & 0x10);
      return {
        transmissionStatus: transmissionStatus,
        readRequestFlag: readRequestFlag,
        updateFlag: updateFlag,
        validFlag: validFlag
      };
    };
    let payload = [];
    let i = 0;
    while (i < data.length - 4) {
      let id = data.readUInt16BE(i);
      i += 2;
      // TODO: state table
      let state = data.readUInt8(i);
      i += 1;

      let length = data.readUInt8(i);
      i += 1;
      let value = null;
      // check for length
      if (data.length >= i + length) {
        value = data.slice(i, i + length);
        i += length;
      }
      payload.push({
        id: id,
        state: processStateByte(state),
        length: length,
        value: value
      });
    }
    return payload;
  }

  static _GetDatapointValueRes(data) {
    const serviceName = "GetDatapointValue.Res";
    let service = this._findServiceByName(serviceName);
    if (data.length < 4) {
      throw RangeError(`${serviceName}: data length expected to be >= 4 but is ${data.length}`);
    }
    let start = data.readUInt16BE(0);
    let number = data.readUInt16BE(2);
    if (number !== 0) {
      // success
      let payloadPart = data.slice(4);
      let payload = this._processDatapointValuePayload(payloadPart);
      return {
        service: serviceName,
        direction: service.direction,
        error: false,
        start: start,
        number: number,
        payload: payload
      };
    } else {
      let errorCode = data.readUInt8(4);
      let error = this._findErrorByCode(errorCode);
      return {
        service: serviceName,
        direction: service.direction,
        error: true,
        start: start,
        number: 0,
        payload: error
      };
    }
  }
  
  static _GetDescriptionStringRes(data) {
    const serviceName = "GetDescriptionString.Res";
    let service = this._findServiceByName(serviceName);
    if (data.length < 5) {
      throw new RangeError(`${serviceName}: data length expeted to be > 5 but got ${data.length}`);
    }
    let start = data.readUInt16BE(0);
    let number = data.readUInt16BE(2);
    if (number !== 0) {
      let payloadPart = data.slice(4);
      let payload = this._processDescriptionStringPayload(payloadPart);
      return {
        service: serviceName,
        direction: service.direction,
        error: false,
        start: start,
        number: number,
        payload: payload
      };
    } else {
      let errorCode = data.readUInt8(4);
      let error = this._findErrorByCode(errorCode);
      return {
        service: serviceName,
        direction: service.direction,
        error: true,
        start: start,
        number: number,
        payload: error
      };
    }
  }

  static _DatapointValueInd(data) {
    const serviceName = "DatapointValue.Ind";
    let service = this._findServiceByName(serviceName);
    if (data.length < 4) {
      throw RangeError(`${serviceName}: data length expected to be >= 4 but is ${data.length}`);
    }
    let start = data.readUInt16BE(0);
    let number = data.readUInt16BE(2);
    let payloadPart = data.slice(4);
    let payload = this._processDatapointValuePayload(payloadPart);
    return {
      service: serviceName,
      direction: service.direction,
      error: false,
      start: start,
      number: number,
      payload: payload
    };
  }
  static _SetServerItemRes(data) {
    const serviceName = "SetServerItem.Res";
    let service = this._findServiceByName(serviceName);
    if (data.length !== 5) {
      throw RangeError(`${serviceName}: data length expected to be 5 but is ${data.length}`);
    }
    let start = data.readUInt16BE(0);
    let number = data.readUInt16BE(2);
    let errorCode = data.readUInt8(4);
    if (errorCode === 0) {
      return {
        service: serviceName,
        direction: service.direction,
        error: false,
        start: start,
        number: number,
        payload: null
      };
    } else {
      let error = this._findErrorByCode(errorCode);
      return {
        service: serviceName,
        direction: service.direction,
        error: true,
        start: start,
        number: number,
        payload: error
      };
    }
  }

  static _SetDatapointValueRes(data) {
    const serviceName = "SetDatapointValue.Res";
    let service = this._findServiceByName(serviceName);
    if (data.length !== 5) {
      throw RangeError(`${serviceName}: data length expected to be 5 but is ${data.length}`);
    }
    let start = data.readUInt16BE(0);
    let number = data.readUInt16BE(2);
    let errorCode = data.readUInt8(4);
    if (errorCode === 0) {
      return {
        service: serviceName,
        direction: service.direction,
        error: false,
        start: start,
        number: number,
        payload: null
      };
    } else {
      let error = this._findErrorByCode(errorCode);
      return {
        service: serviceName,
        direction: service.direction,
        error: true,
        start: start,
        number: number,
        payload: error
      };
    }
  }

  static _GetParameterByteRes(data) {
    const serviceName = "GetParameterByte.Res";
    let service = this._findServiceByName(serviceName);
    if (data.length < 5) {
      throw new RangeError(`${serviceName}: data length expected to be > 5 but got ${data.length}`);
    }
    let start = data.readUInt16BE(0);
    let number = data.readUInt16BE(2);
    // if number === 0 then we return error
    if (number !== 0) {
      let payload = data.slice(4);
      return {
        service: serviceName,
        direction: service.direction,
        error: false,
        start: start,
        number: number,
        payload: payload
      };
    } else {
      let errorCode = data.readUInt8(4);
      let error = this._findErrorByCode(errorCode);
      return {
        service: serviceName,
        direction: service.direction,
        error: true,
        start: start,
        number: number,
        payload: error
      };
    }
  }
  
  static _processDatapointDescriptionPayload(data) {
    let payload = [];
    let i = 0;
    const findDptType = code => {
      const dptTypes = [
        { code: 0, dpt: "disabled" },
        { code: 1, dpt: "dpt1" },
        { code: 2, dpt: "dpt2" },
        { code: 3, dpt: "dpt3" },
        { code: 4, dpt: "dpt4" },
        { code: 5, dpt: "dpt5" },
        { code: 6, dpt: "dpt6" },
        { code: 7, dpt: "dpt7" },
        { code: 8, dpt: "dpt8" },
        { code: 9, dpt: "dpt9" },
        { code: 10, dpt: "dpt10" },
        { code: 11, dpt: "dpt11" },
        { code: 12, dpt: "dpt12" },
        { code: 13, dpt: "dpt13" },
        { code: 14, dpt: "dpt14" },
        { code: 15, dpt: "dpt15" },
        { code: 16, dpt: "dpt16" },
        { code: 17, dpt: "dpt17" },
        { code: 18, dpt: "dpt18" },
        { code: 255, dpt: "unknown" }
      ];
      const findByCode = t => t.code === code;
      let dptType = dptTypes.find(findByCode);
      if (dptType !== null && typeof dptType === "object") {
        return dptType.dpt;
      } else {
        return "unknown";
      }
    };
    const findValueType = code => {
      const valueTypes = [
        { code: 0, length: 1 },
        { code: 1, length: 1 },
        { code: 2, length: 1 },
        { code: 3, length: 1 },
        { code: 4, length: 1 },
        { code: 5, length: 1 },
        { code: 6, length: 1 },
        { code: 7, length: 1 },
        { code: 8, length: 2 },
        { code: 9, length: 3 },
        { code: 10, length: 4 },
        { code: 11, length: 6 },
        { code: 12, length: 8 },
        { code: 13, length: 10 },
        { code: 14, length: 14 }
      ];
      const findByCode = t => t.code === code;
      let valueType = valueTypes.find(findByCode);
      if (valueType !== null && typeof valueType === "object") {
        return valueType.length;
      } else {
        return "unknown";
      }
    };
    const processConfigFlags = code => {
      const transmitPriorityTable = [
        { code: 0, value: "system" },
        { code: 1, value: "high" },
        { code: 2, value: "alarm" },
        { code: 3, value: "low" }
      ];
      const transmitPriorityCode = code & 0x03;
      const transmitPriorityValue = transmitPriorityTable.find(t => t.code === transmitPriorityCode).value;
      const datapointCommunication = !!(code & 0x04);
      const read = !!(code & 0x08);
      const write = !!(code & 0x10);
      const readOnInit = !!(code & 0x20);
      const transmitToBus = !!(code & 0x40);
      const updateOnResponse = !!(code & 0x80);
      return {
        priority: transmitPriorityValue,
        communication: datapointCommunication,
        read: read,
        write: write,
        readOnInit: readOnInit,
        transmit: transmitToBus,
        update: updateOnResponse
      };
    };
    while (i < data.length - 4) {
      let id = data.readUInt16BE(i);
      let valueTypeByte = data.readUInt8(i + 2);
      let configFlagsByte = data.readUInt8(i + 3);
      let dptCode = data.readUInt8(i + 4);
      i += 5;
      payload.push({
        id: id,
        length: findValueType(valueTypeByte),
        flags: processConfigFlags(configFlagsByte),
        dpt: findDptType(dptCode)
      });
    }
    return payload;
  }
  
  static _processDescriptionStringPayload(data) {
   let payload = [];
    let i = 0;
    while (i < data.length - 2) {
      let id = data.readUInt16BE(i);
      i += 2;
      let length = data.readUInt8(i);
      i += 1;

      let value = null;
      // check for length
      if (data.length >= i + length) {
        value = data.slice(i, i + length);
        i += length;
      }
      payload.push({
        id: id,
        length: length,
        value: value
      });
    }
    return payload;
  }
  
  static _GetDatapointDescriptionRes(data) {
    const serviceName = "GetDatapointDescription.Res";
    let service = this._findServiceByName(serviceName);
    if (data.length < 5) {
      throw new RangeError(`${serviceName}: data length expeted to be > 5 but got ${data.length}`);
    }
    let start = data.readUInt16BE(0);
    let number = data.readUInt16BE(2);
    if (number !== 0) {
      let payloadPart = data.slice(4);
      let payload = this._processDatapointDescriptionPayload(payloadPart);
      return {
        service: serviceName,
        direction: service.direction,
        error: false,
        start: start,
        number: number,
        payload: payload
      };
    } else {
      let errorCode = data.readUInt8(4);
      let error = this._findErrorByCode(errorCode);
      return {
        service: serviceName,
        direction: service.direction,
        error: true,
        start: start,
        number: number,
        payload: error
      };
    }
  }

  static _processServerItemData(data) {
    // TODO: Item table (?)
    let payload = [];
    let i = 0;
    while (i < data.length - 3) {
      let id = data.readUInt16BE(i);
      i += 2;
      let length = data.readUInt8(i);
      i += 1;

      let value = null;
      // check for length
      if (data.length >= i + length) {
        value = data.slice(i, i + length);
        i += length;
      }
      payload.push({
        id: id,
        length: length,
        value: value
      });
    }
    return payload;
  }

  static _ServerItemInd(data) {
    const serviceName = "ServerItem.Ind";
    const service = this._findServiceByName(serviceName);
    const start = data.readUInt16BE(0);
    const number = data.readUInt16BE(2);
    const payloadPart = data.slice(4);
    const payload = this._processServerItemData(payloadPart);
    return {
      service: serviceName,
      direction: service.direction,
      error: false,
      start: start,
      number: number,
      payload: payload
    };
  }

  static _GetServerItemRes(data) {
    const serviceName = "GetServerItem.Res";
    const service = this._findServiceByName(serviceName);
    const start = data.readUInt16BE(0);
    const number = data.readUInt16BE(2);
    if (number !== 0) {
      const payloadPart = data.slice(4);
      const payload = this._processServerItemData(payloadPart);
      return {
        service: serviceName,
        direction: service.direction,
        error: false,
        start: start,
        number: number,
        payload: payload
      };
    } else {
      let errorCode = data.readUInt8(4);
      let error = this._findErrorByCode(errorCode);
      return {
        service: serviceName,
        direction: service.direction,
        error: true,
        start: start,
        number: number,
        payload: error
      };
    }
  }

  // process incoming data
  static processIncomingMessage(data) {
    if (data !== null && Buffer.isBuffer(data)) {
      let main = data.readUInt8(0);
      let sub = data.readUInt8(1);
      let dataPart = data.slice(2);
      const filterByMain = t => t.main === main;
      const findBySub = t => t.sub === sub;
      let filteredServices = Services.filter(filterByMain);
      if (filteredServices !== null && Array.isArray(filteredServices)) {
        const service = filteredServices.find(findBySub);
        if (service !== null && typeof service === "object") {
          try {
            switch (service.name) {
              case "GetDatapointDescription.Res":
                return this._GetDatapointDescriptionRes(dataPart);
              case "GetDescriptionString.Res":
                return this._GetDescriptionStringRes(dataPart);
              case "GetServerItem.Res":
                return this._GetServerItemRes(dataPart);
              case "SetServerItem.Res":
                return this._SetServerItemRes(dataPart);
              case "ServerItem.Ind":
                return this._ServerItemInd(dataPart);
              case "GetDatapointValue.Res":
                return this._GetDatapointValueRes(dataPart);
              case "DatapointValue.Ind":
                return this._DatapointValueInd(dataPart);
              case "GetParameterByte.Res":
                return this._GetParameterByteRes(dataPart);
              case "SetDatapointValue.Res":
                return this._SetDatapointValueRes(dataPart);
              default:
                break;
            }
          } catch (e) {
            console.log(`Catch error while processing service ${service.name} data: `, dataPart, "error:", e);
          }
        } else {
          throw new RangeError(`Cannot find service with main=${main} and sub=${sub}`);
        }
      } else {
        throw new Error(`No services with main ${main}`);
      }
    } else {
      throw new TypeError("Incoming data should be Buffer");
    }
  }

  static _findErrorByCode(errorCode) {
    const findByErrorCode = t => t.code === errorCode;
    const error = Errors.find(findByErrorCode);
    if (error !== null && typeof error === "object") {
      return Errors.find(findByErrorCode);
    } else {
      throw new RangeError(`_findErrorByCode: couldn't find error by code: ${errorCode}`);
    }
  }

  static _findServiceByName(serviceName) {
    const findByName = t => t.name === serviceName;
    const service = Services.find(findByName);
    if (service !== null && typeof service === "object") {
      return service;
    } else {
      throw new RangeError(`_findServiceByCode: couldn't find service by name: ${serviceName}`);
    }
  }
}

module.exports = ObjectServerProtocol;
