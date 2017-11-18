import logger from './logger';

// logging funcs
const info = (...args) => {
  let message = {
    source: "lib/objectServerProtocol.js",
    data: args
  };
  logger.info(JSON.stringify(message))
};
const debug = (...args) => {
  let message = {
    source: "lib/objectServerProtocol.js",
    data: args
  };
  logger.debug(JSON.stringify(message))
};
const error = (...args) => {
  let message = {
    source: "lib/objectServerProtocol.js",
    data: args
  };
  logger.error(JSON.stringify(message))
};


/**
 * Class with static methods to compose/parse messages
 */
class ObjectServerProtocol {
    static _getServices() {
        // create services item so we could find service by name/value
        let services = [];
        // serverItem
        services.push({
            name: 'GetServerItem.Req',
            mainService: 0xf0,
            subService: 0x01
        });
        services.push({
            name: 'GetServerItem.Res',
            mainService: 0xf0,
            subService: 0x81
        });
        services.push({
            name: 'SetServerItem.Req',
            mainService: 0xf0,
            subService: 0x02
        });
        services.push({
            name: 'SetServerItem.Res',
            mainService: 0xf0,
            subService: 0x82
        });
        // datapoint description
        services.push({
            name: 'GetDatapointDescription.Req',
            mainService: 0xf0,
            subService: 0x03
        });
        services.push({
            name: 'GetDatapointDescription.Res',
            mainService: 0xf0,
            subService: 0x83
        });
        // description string
        services.push({
            name: 'GetDescriptionString.Req',
            mainService: 0xf0,
            subService: 0x04
        });
        services.push({
            name: 'GetDescriptionString.Res',
            mainService: 0xf0,
            subService: 0x84
        });
        // datapoint value
        services.push({
            name: 'GetDatapointValue.Req',
            mainService: 0xf0,
            subService: 0x05
        });
        services.push({
            name: 'GetDatapointValue.Res',
            mainService: 0xf0,
            subService: 0x85
        });
        services.push({
            name: 'DatapointValue.Ind',
            mainService: 0xf0,
            subService: 0xc1
        });
        services.push({
            name: 'SetDatapointValue.Req',
            mainService: 0xf0,
            subService: 0x06
        });
        services.push({
            name: 'SetDatapointValue.Res',
            mainService: 0xf0,
            subService: 0x86
        });
        // parameter byte
        services.push({
            name: 'GetParameterByte.Req',
            mainService: 0xf0,
            subService: 0x07
        });
        services.push({
            name: 'SetParameterByte.Req',
            mainService: 0xf0,
            subService: 0x87
        });
        return services;
    }

    /**
     * GetServerItem.Req: request from client to server to get one or more server properties.
     * @param params {Object} {start: 0, number: 1}
     * @returns {Buffer}
     */
    static GetServerItemReq(params) {
        const serviceName = 'GetServerItem.Req';
        const findByServiceName = service => service.name === serviceName;
        const service = this._getServices().find(findByServiceName);
        if (service) {
            const mainService = service.mainService;
            const subService = service.subService;
            const start = params.start;
            const number = params.number;
            return Buffer.from([mainService, subService, start, number]);
        } else {
            error('unknown service');
        }
    }

    // should be private
    static __int32ToBuffer(number) {
        let res = [];
        res.push(number >> 8);
        res.push(number & 0xff);
        return Buffer.from(res);
    }

    /**
     * GetDatapointDescription.Req: request from client to server to get description of datapoints.
     * @param params {Object} {start: 0, number: 1}
     * @returns {Buffer}
     */
    static GetDatapointDescriptionReq(params) {
        const serviceName = 'GetDatapointDescription.Req';
        const findByServiceName = service => service.name === serviceName;
        const service = this._getServices().find(findByServiceName);
        if (service) {
            const mainService = service.mainService;
            const subService = service.subService;
            const start = params.start;
            const number = params.number;

            let servicePart = Buffer.from([mainService, subService]);
            let dpPart = Buffer.concat([ObjectServerProtocol.__int32ToBuffer(start), ObjectServerProtocol.__int32ToBuffer(number)]);
            return Buffer.concat([servicePart, dpPart]);
        } else {
            error('unknown service');
        }
    }

    /**
     * GetDescriptionString.Req: request from client to server to get description string of datapoints.
     * @param params {Object} {start: 0, number: 1}
     * @returns {Buffer}
     */
    static GetDescriptionStringReq(params) {
        // get error 05 - service is not supported
        // DONE: check on kBerry
        // DONE: check: [f0 84 03 e7 00 00 05] - service is not supported?
        const serviceName = 'GetDescriptionString.Req';
        const findByServiceName = service => service.name === serviceName;
        const service = this._getServices().find(findByServiceName);
        if (service) {
            const mainService = service.mainService;
            const subService = service.subService;
            const start = params.start;
            const number = params.number;

            let servicePart = Buffer.from([mainService, subService]);
            let dpPart = Buffer.concat([ObjectServerProtocol.__int32ToBuffer(start), ObjectServerProtocol.__int32ToBuffer(number)]);
            return Buffer.concat([servicePart, dpPart]);
        } else {
            error('unknown service');
        }
    }

    /**
     * GetDatapointValue.Req: request from client to server to get the values of datapoints.
     * @param params {Object} {start: 0, number: 1}
     * @returns {Buffer}
     */
    static GetDatapointValueReq(params) {
        // TODO: filter! +6 byte
        const serviceName = 'GetDatapointValue.Req';
        const findByServiceName = service => service.name === serviceName;
        const service = this._getServices().find(findByServiceName);
        if (service) {
            const mainService = service.mainService;
            const subService = service.subService;
            const start = params.start;
            const number = params.number;
            let servicePart = Buffer.from([mainService, subService]);
            let dpPart = Buffer.concat([ObjectServerProtocol.__int32ToBuffer(start), ObjectServerProtocol.__int32ToBuffer(number)]);
            return Buffer.concat([servicePart, dpPart]);

        } else {
            error('unknown service');
        }
    }

    /**
     * SetDatapointValue.Req: request from client to server to set the new values of datapoints or request/transmit new value on bus.
     * @param params {Object} {start: 0, number: 1, payload: {id: 0, cmd: 'set and send', length: 1, value: 1} || [{..}, {..}]}
     * @returns {Buffer}
     */
    static SetDatapointValueReq(params) {
        const serviceName = 'SetDatapointValue.Req';
        const findByServiceName = service => service.name === serviceName;
        const service = this._getServices().find(findByServiceName);
        if (service) {
            const mainService = service.mainService;
            const subService = service.subService;
            const start = params.start;
            const number = params.number;
            // now compose message
            //let message = Buffer.from([mainService, subService, start, number]);

            let servicePart = Buffer.from([mainService, subService]);
            let dpPart = Buffer.concat([ObjectServerProtocol.__int32ToBuffer(start), ObjectServerProtocol.__int32ToBuffer(number)]);
            //let message = Buffer.concat(servicePart, dpPart);
            let payloadPart;
            const payload = params.payload;
            if (payload) {
                // create array of datapoints, commands, values
                const payloadItemCmd = (item) => {
                    let res = Buffer.from([]);
                    // command list
                    const commands = [
                        {name: 'no command', value: 0},
                        {name: 'set', value: 1},
                        {name: 'send', value: 2},
                        {name: 'set and send', value: 3}, // default
                        {name: 'read', value: 4},
                        {name: 'clear', value: 5},
                    ];
                    let id = ObjectServerProtocol.__int32ToBuffer(item.id);
                    let cmd = item.cmd || 'set and send';
                    let length = item.length || 0; // TODO: (?) calculate dp value length

                    // composing length and command
                    let command = commands.find(item => {
                        return item.name === cmd
                    });
                    if (command) {
                        let cmd_length = (command.value << 4) | length;
                        res = Buffer.concat([id, Buffer.from([command.value, length])]);
                        if (item.value) {
                            //let value = item.value;
                            return Buffer.concat([res, item.value]);
                        }
                        return res;
                    } else {
                        error('unknown command', item.name);
                    }
                };
                if (Array.isArray(payload)) {
                    // if we transfer multiple dtp as array
                    payloadPart = Buffer.from(payload.map(item => payloadItemCmd(item)));
                } else {
                    // if we transfer one dtp as object
                    payloadPart = payloadItemCmd(payload);
                }
                return Buffer.concat([servicePart, dpPart, payloadPart]);

            } else {
                error('please specify payload');
            }
        } else {
            error('unknown service', serviceName);
        }
    }

    // bufferToNumber
    static __bufferToNumber(buf) {
        let byte1 = buf[0];
        let byte0 = buf[1];
        return (byte1 << 8) | byte0;
    }

    /**
     * parseMessage: parse message from server to client.
     * @param data {Buffer} data to be parsed
     * @returns {Buffer}
     */
    static parseMessage(data) {
        debug('ObjServerProto parse data:', data);
        const parseDatapoints = (dtps) => {
            // console.log('dpts', dtps);
            let startBuf = Buffer.from(dtps.slice(0, 2));
            let start = ObjectServerProtocol.__bufferToNumber(startBuf);
            // console.log(startBuf);
            let numberBuf = Buffer.from(dtps.slice(2, 4));
            // console.log(numberBuf);
            let number = ObjectServerProtocol.__bufferToNumber(numberBuf);
            let returnData = {
                start: start,
                number: number
            };
            debug('parse message: ', returnData);
            let values = dtps.slice(4);
            let i = 0;
            let payload = [];
            while (i < values.length) {
                let dpBuf = Buffer.from(values.slice(i, i + 2));
                // console.log('dpBuf', dpBuf);
                let dpID = ObjectServerProtocol.__bufferToNumber(dpBuf);
                i += 2;
                let dpStateByte = values[i];
                // console.log('dpStateLength', dpStateByte);
                i += 1;
                let dpLength = values[i];
                i += 1;
                let dpStateObj = {
                    update: (dpStateByte & 0x80) >> 7,
                    read: (dpStateByte & 0x40) >> 6
                };
                switch (dpStateByte & 0x30) {
                    case 0:
                        dpStateObj.transmission = "ok";
                        break;
                    case 1:
                        dpStateObj.transmission = "error";
                        break;
                    case 2:
                        dpStateObj.transmission = "in progress";
                        break;
                    case 3:
                        dpStateObj.transmission = "request";
                        break;
                    default:
                        break;
                }

                let dpValue = values.slice(i, i + dpLength);
                payload.push({
                    id: dpID,
                    state: dpStateByte,
                    length: dpLength,
                    value: dpValue
                });
                i += dpLength;
            }
            returnData.payload = payload;
            // console.log('parse message: ', returnData);
            return returnData;
        };

        if (Buffer.isBuffer(data) || Array.isArray(data)) {
            const mainService = data[0];
            const subService = data[1];
            const findByServiceValue = service => {
                return service.mainService === mainService && service.subService === subService;
            };
            const service = this._getServices().find(findByServiceValue);
            if (service) {
                let serviceName = service.name;
                let dtps, returnData;
                // now depends on service
                switch (serviceName) {
                    case "DatapointValue.Ind":
                        dtps = data.slice(2);
                        returnData = parseDatapoints(dtps);
                        returnData.service = serviceName;
                        return returnData;
                        break;
                    case "GetDatapointValue.Res":
                        dtps = data.slice(2);
                        returnData = parseDatapoints(dtps);
                        returnData.service = serviceName;
                        return returnData;
                        break;
                    case "SetDatapointValue.Res":
                        // TODO: parse errors
                        // [ +0 main service | +1 subservice | { +2 start | +3 number (0x00 without err) | +4 error (0x00 - no
                        // err)}]

                        // assume that there is no error
                        returnData = {};
                        let start = ObjectServerProtocol.__bufferToNumber(Buffer.from([data[2], data[3]]));
                        let number = ObjectServerProtocol.__bufferToNumber(Buffer.from([data[4], data[5]]));
                        let error = data[6];
                        returnData.start = start;
                        returnData.number = number;
                        returnData.error = error;
                        returnData.service = serviceName;
                        return returnData;
                        break;
                    default:
                        break;
                }
            } else {
                erro("service is not found")
            }
        } else {
            error("data is not buffer or array")
        }
    }
}

export default ObjectServerProtocol;