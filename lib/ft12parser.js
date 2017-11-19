import logger from './logger';

/**
 * Parser for serialPort var in FT12Communication.js
 * emit events on incoming data for fixed and variable frames
 * @returns {function(*, *)}
 */

// logging funcs
const info = (...args) => {
  let message = {
    source: "lib/ft12parser.js",
    data: args
  };
  logger.info(message)
};
const debug = (...args) => {
  let message = {
    source: "lib/ft12parser.js",
    data: args
  };
  logger.debug(message)
};
const error = (...args) => {
  let message = {
    source: "lib/ft12parser.js",
    data: args
  };
  logger.error(message)
};

const ft12parser = () => {
    // first is ack 0xE5
    const ackFrame = Buffer.from([0xE5]);
    // sometimes we get this. it is not described in protocol.
    // second is reset req, not sure is object server sends it
    const resetReq = Buffer.from([0x10, 0x40, 0x40, 0x16]);
    // third is reset ind
    const resetInd = Buffer.from([0x10, 0xC0, 0xC0, 0x16]);
    // now data message
    const dataStart = Buffer.from([0x68]);
    const dataEnd = Buffer.from([0x16]);
    const fixedFrameLength = 4;

    // now we begin
    let buf = Buffer.alloc(0);
    let length = 0;
    return (emitter, buffer) => {
        buf = Buffer.concat([buf, buffer]);
        debug("ft12parsing data:", buf);
        length = buf.length;

        // received acknowledge
        if (length >= 1) {
            let firstByte = buf.slice(0, 1);
            if (firstByte.compare(ackFrame) === 0) {
                buf = buf.slice(1);
                emitter.emit('ack', ackFrame);
            }
        }

        // now resetInd
        if (length >= fixedFrameLength) {
            let first4Bytes = buf.slice(0, fixedFrameLength);
            if (first4Bytes.compare(resetInd) === 0) {
                buf = buf.slice(fixedFrameLength);
                emitter.emit('reset', resetInd);
            }
        }
        // now data frame
        if (length >= fixedFrameLength) {
            let firstByte = buf.slice(0, 1);
            let thirdByte = buf.slice(3, 4);
            if (firstByte.compare(dataStart) === 0 && thirdByte.compare(dataStart) === 0) {
                let data = buf.slice(0, buf.length);
                let dataLength1 = buf[1];
                let dataLength2 = buf[2];
                let totalLength = 4 + dataLength1 + 2;
                // first, check if we have received buffer completely
                if (buf.length >= totalLength) {
                    let lastByte = buf.slice(totalLength - 1, totalLength);
                    if (dataLength1 === dataLength2 && lastByte.compare(dataEnd) === 0) {
                        buf = buf.slice(totalLength);
                        emitter.emit('data', data);
                    }
                }
            } else {
                // In case buffer length > 3 but buffer neither fixed frame nor data frame we're moving next
                buf = buf.slice(1);
            }

        }
    }
};

export default ft12parser;