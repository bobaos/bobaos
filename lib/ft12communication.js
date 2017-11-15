import SerialPort from 'serialport'
import ft12parser from './ft12parser';
import EventEmitter from 'events';
import logger from './logger';

// TODO: message queue: check
// TODO: get ack at start, reset -> no ack -> 'trying to reconnect' timeout -> ack -> good!
/**
 * Class implementing FT1.2 communication over serialport
 */
class FT12Communication extends EventEmitter {
    /**
     *
     * @param props serialPortParams, serialPortDevice
     * in constructor we open serial port, register event listeners as
     * send reset request when port open
     */
    constructor(props) {
        super(props);
        let serialPortParams = props.serialPortParams;
        let serialPortDevice = props.serialPortDevice;
        serialPortParams.parser = ft12parser();
        const port = new SerialPort(serialPortDevice, serialPortParams);
        // on open we
        port.on('open', () => {
            // do deals
            // reset
            logger.info('port opened. sending reset request');
            this.sendResetRequest();

            // wait for ack
            this.resetIntervalTime = 1000;
            this.resetIntervalCount = 0;
            this.resetInterval = setInterval(() => {
                if (!this.reset && this.resetIntervalCount < 3) {
                    this.resetIntervalCount++;
                    logger.info("sending reset request: ", this.resetIntervalCount);
                    this.sendResetRequest();
                }
            }, this.resetIntervalTime);

            // then proceed to next
            // this.emit('open')
        });
        port.on('error', err => this.emit('error', err));
        port.on('data', data => this.parseMessage(data));

        // TODO: create different funcs for ack and reset?
        port.on('ack', data => {
            // if it was response to reset request
            if (!this.reset) {
                logger.info("got acknowledge for reset request. proceeding..");
                // set reset flag
                this.reset = true;
                // clear interval
                clearInterval(this.resetInterval);
                // proceed to next object
                this.emit('open');
            }
            // anyway
            // set queue ack status to true
            this.queue.ack = true;
            // clear timeout
            clearTimeout(this.queue.ackTimeout);

            // emit next
            this.emit('ack', data);

        });
        port.on('reset', data => {
            // do deal
            // ...
            // emit next
            // TODO: switch frameCount ?
            this.emit('reset', data)
        });
        this.port = port;
        this.frameCount = 'odd';

        //queue 27.06.17
        this.queue = {
            ack: false,
            ackTimeout: null,
            ackTimeoutTime: 300, // timeout for telegram acknowledge
            intervalTime: 50,
            interval: null,
            data: [],
        };
        this.queue.run = () => {
            // check if we got ack response to last message
            // logger.info("queue run: ", 1);
            // TODO: queue ack timeout
            if (this.queue.ack) {
                // logger.info("queue run: ", 2);
                if (this.queue.data.length > 0) {
                    // get data
                    let data = this.queue.data.shift();
                    logger.info("queue send: ", data);
                    // send message then
                    this.port.write(data);
                    // set ack to false
                    this.queue.ack = false;
                    this.queue.lastData = data;
                    // set timeout for telegram acknowledge
                    this.queue.ackTimeout = setTimeout(() => {
                        this.queue.ack = true;
                        logger.info("timeout to get acknowledge for data: ", new Buffer(this.queue.lastData));
                        //this.switchFrameCount();
                    }, this.queue.ackTimeoutTime);
                    // now check if queue is empty
                    if (this.queue.data.length === 0) {
                        clearInterval(this.queue.interval);
                        this.queue.interval = null;
                    }
                }
            }
        };
        // first reset
        this.reset = false;

    }

    // send2queue(data) {
    //     this.queue.items.push(data);
    //     // 0 - ready to send, 1 - awaiting ack
    //     if (this.queue.status === 0) {
    //         // get first message and write to port
    //         let message = this.queue.items.shift();
    //         this.port.write(message);
    //         this.switchFrameCount();
    //         // now we are awaiting ack
    //         this.queue.status = 1;
    //     } else {
    //         // awaiting ack
    //     }
    //
    // }
    // proceedQueue() {
    //     this.queue.status = 0;
    //     if (this.queue.length > 0) {
    //         let message = this.queue.shift();
    //         this.port.write(message);
    //         this.queue.status = 1;
    //     }
    // }
    switchFrameCount() {
        switch (this.frameCount) {
            case 'odd':
                this.frameCount = 'even';
                break;
            case 'even':
                this.frameCount = 'odd';
                break;
            default:
                break;
        }
    }

    /**
     * send reset request and reset frame count variable
     */
    sendResetRequest() {
        // TODO: all fixed messages to different file
        const resetRequest = new Buffer([0x10, 0x40, 0x40, 0x16]);
        //this.send2queue(resetRequest);
        this.port.write(resetRequest);
        // write frame to odd
        // TODO: reset frame count on incoming 'reset' event ?
        this.frameCount = 'odd';
    }

    sendAck() {
        const ack = new Buffer([0xE5]);
        this.port.write(ack);
    }

    // parse data frame
    parseMessage(data) {
        let startByte1 = data[0];
        let startByte2 = data[3];
        let lengthByte1 = data[1];
        let lengthByte2 = data[2];
        let controlByte = data[4];
        let checksum = data[data.length - 2];
        let endByte = data[data.length - 1];
        let message = data.slice(5, data.length - 2);
        // todo: checksum calculation?
        if (startByte1 === startByte2 && lengthByte1 === lengthByte2 && endByte === 0x16) {
            this.emit('message', message);
        } else {
            logger.info('invalid data frame');
        }
    }

    sendMessage(message) {
        let data = new Buffer([]);
        const startByte = 0x68;
        const endByte = 0x16;
        const controlByte = this.frameCount === 'odd' ? 0x73 : 0x53;
        const lengthByte = message.length + 1;
        // checksum
        let sum = message.reduce((a, b) => a + b, 0) + controlByte;
        const checksum = (sum % 256);
        // compose frame
        data = Buffer.concat([new Buffer([startByte]), new Buffer([lengthByte]), new Buffer([lengthByte]), new Buffer([startByte])]);
        // data.push(startByte);
        // data.push(lengthByte);
        // data.push(lengthByte);
        // data.push(startByte);
        data = Buffer.concat([data, new Buffer([controlByte]), message, new Buffer([checksum]), new Buffer([endByte])]);
        // data.push(controlByte);
        // data = data.concat(message);
        // data.push(checksum);
        // data.push(endByte);
        logger.info('send message: ', new Buffer(data));
        // working with queue
        // push to queue
        this.queue.data.push(data);
        // start interval to run queue
        if (this.queue.interval === null) {
            logger.info("setting new queue interval");
            this.queue.interval = setInterval(this.queue.run, this.queue.intervalTime);
        }

        // old
        // this.port.write(data);
        // now switch frame count
        this.switchFrameCount();
    }
}

export default FT12Communication;