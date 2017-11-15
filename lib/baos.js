// nodejs
import EventEmitter from 'events';

// baos
import FT12Communication from './ft12communication';
import ObjectServerProtocol from './objectServerProtocol';
import * as DPT from './dpt';

import logger from './logger';

// logging funcs
const info = (level, ...args) => {

};

class Baos extends EventEmitter {
    constructor(props) {
        super(props);

        // serial port
        this.ft12 = new FT12Communication(props.serialPortConfig);

        // serial port events
        this.ft12.on('open', () => {
            this._ft12onOpen()
        });
        this.ft12.on('ack', (ack) => {
            this._ft12onAck(ack)
        });
        this.ft12.on('reset', () => {
            this._ft12onReset()
        });
        this.ft12.on('message', (message) => {
            this._ft12onMessage(message)
        });

    }

    // serial port events
    _ft12onOpen() {
        logger.debug('', 'ft12 port opened!');
        this.emit('open');
    }

    _ft12onAck(ack) {
        logger.debug('ft12 on ack: ', ack);
        this.emit('ack', ack);
    }

    _ft12onReset() {
        logger.info('ft12 on reset ind');
        this.emit('reset');
        this.ft12.sendAck();
    }

    _ft12onMessage(message) {
        let data = ObjectServerProtocol.parseMessage(message);
        // logger.info("parsed data:", JSON.stringify(data));
        logger.debug('baos: ', message);
        // TODO: datapoint ind event.
        // now get through data
        const processPayload = (payload, callback) => {
            if (Array.isArray(payload)) {
                payload.forEach((payloadItem) => {
                    let id = payloadItem.id;
                    const findDatapointById = (item) => item.id === id;
                    let datapoint = this.datapoints.find(findDatapointById);
                    if (datapoint) {
                        let name = datapoint.name;
                        let type = datapoint.type;
                        let value;
                        switch (type) {
                            case 'dpt1':
                                value = DPT.get.dpt1(payloadItem.value);
                                break;
                            case 'dpt5':
                                value = DPT.get.dpt5(payloadItem.value);
                                break;
                            case 'dpt9':
                                value = DPT.get.dpt9(payloadItem.value);
                                break;
                            default:
                                logger.info('datapoint type is not supported');
                                break;
                        }
                        //this.emit('value', service, datapoint, value)
                        if (typeof callback === 'function') {
                            callback(datapoint, value);
                        }
                    } else {
                        logger.info('cannot find datapoint by id: ', payloadItem);
                    }
                });
            } else {
                // TODO: something
                logger.info('payload is not array!');
            }
        };
        if (data && data.payload) {
            let service = data.service;
            switch (service) {
                case 'DatapointValue.Ind':
                    processPayload(data.payload, (datapoint, value) => {
                        this.emit('value', {service: service, datapoint: datapoint, value: value});
                    });
                    break;
                case 'GetDatapointValue.Res':
                    processPayload(data.payload, (datapoint, value) => {
                        this.emit('value', {service: service, datapoint: datapoint, value: value});
                    });
                    break;
                default:
                    logger.info('service is not implemented yet:', service);
            }
        }
        // send acknowledge in any case
        this.ft12.sendAck();
    }

    // works with datapoint
    importDatapoints(datapoints) {
        // datapoints = [{name: "switch 1", id: 1, type: "dpt1"}, {name: "temperature 1", id: 2, type: "dpt9}]
        // copy array
        this.datapoints = datapoints.slice();
    }

    // works with datapoints
    setDatapoint(datapointName, setValue) {
        const findDatapointByName = (item) => item.name === datapointName;
        let datapointItem = this.datapoints.find(findDatapointByName);
        if (datapointItem) {
            let length, value;
            switch (datapointItem.type) {
                case 'dpt1':
                    length = 1;
                    value = DPT.set.dpt1(setValue);
                    break;
                case 'dpt5':
                    length = 1;
                    value = DPT.set.dpt5(setValue);
                    break;
                case 'dpt9':
                    length = 2;
                    value = DPT.set.dpt9(setValue);
                    break;
                default:
                    logger.info('datapoint type isn\'t supported: ', datapointItem);
                    break;
            }
            let message = ObjectServerProtocol.SetDatapointValueReq({
                start: datapointItem.id,
                number: 1,
                payload: {
                    id: datapointItem.id,
                    cmd: 'set and send',
                    length: length,
                    value: value
                }
            });
            //logger.info('we are sending data!!! setDatapoint()', message);
            // now we send message
            this.ft12.sendMessage(message);
        } else {
            logger.info('cannot find datapoint by name: ', datapointName);
        }
    }

    setDatapointById(datapointId, setValue) {
        const findDatapointById = (item) => item.id === datapoinId;
        let datapointItem = this.datapoints.find(findDatapointById);
        if (datapointItem) {
            let length, value;
            switch (datapointItem.type) {
                case 'dpt1':
                    length = 1;
                    value = DPT.set.dpt1(setValue);
                    break;
                case 'dpt5':
                    length = 1;
                    value = DPT.set.dpt5(setValue);
                    break;
                case 'dpt9':
                    length = 2;
                    value = DPT.set.dpt9(setValue);
                    break;
                default:
                    logger.info('datapoint type isn\'t supported: ', datapointItem);
                    break;
            }
            let message = ObjectServerProtocol.SetDatapointValueReq({
                start: datapointItem.id,
                number: 1,
                payload: {
                    id: datapointItem.id,
                    cmd: 'set and send',
                    length: length,
                    value: value
                }
            });
            // now we send message
            this.ft12.sendMessage(message);
        } else {
            logger.info('cannot find datapoint by id: ', datapointId);
        }
    }

    getDatapoint(datapointName) {
        const findDatapointByName = (item) => item.name === datapointName;
        let datapointItem = this.datapoints.find(findDatapointByName);
        if (datapointItem) {
            let message = ObjectServerProtocol.GetDatapointValueReq({
                start: datapointItem.id,
                number: 1
            });
            // now we send message
            this.ft12.sendMessage(message);
        } else {
            logger.info('cannot find datapoint by name: ', datapointName);
        }
    }

    // get datapoint by id. no array find required
    getDatapointById(datapointId) {
        let message = ObjectServerProtocol.GetDatapointValueReq({
            start: datapointId,
            number: 1
        });
        // now we send message
        this.ft12.sendMessage(message);
    }

    readDatapoint(datapointName) {
        const findDatapointByName = (item) => item.name === datapointName;
        let datapointItem = this.datapoints.find(findDatapointByName);
        if (datapointItem) {
            let message = ObjectServerProtocol.SetDatapointValueReq({
                start: datapointItem.id,
                number: 1,
                payload: {
                    id: datapointItem.id,
                    cmd: 'read',
                    length: 0,
                }
            });
            logger.info('read datapoint', message.map(item => item.toString(16)));
            // now we send message
            this.ft12.sendMessage(message);
        } else {
            logger.info('cannot find datapoint by name: ', datapointName);
        }
    }

    // read datapoint by id. no array find required
    readDatapointById(datapointId) {
        let message = ObjectServerProtocol.SetDatapointValueReq({
            start: datapointId,
            number: 1,
            payload: {
                id: datapointId,
                cmd: 'read',
                length: 0,
            }
        });
        logger.info('read datapoint', message.map(item => item.toString(16)));
        // now we send message
        this.ft12.sendMessage(message);
    }
    // descr string
    getDescriptionString(start, number) {
        let message = ObjectServerProtocol.GetDescriptionStringReq({
            start: start,
            number: number
        });
        logger.info('get descr string', message.map(item => item.toString(16)));
        this.ft12.sendMessage(message);
    }

}

export default Baos;