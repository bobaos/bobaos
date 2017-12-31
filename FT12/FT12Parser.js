'use strict';
const Transform = require('stream').Transform;

const ACK_FRAME_LENGTH = 1;
const ACK_FRAME = Buffer.from([0xE5]);

const FIXED_FRAME_LENGTH = 4;
const FIXED_FRAME_RESET_IND = Buffer.from([0x10, 0xC0, 0xC0, 0x16]);

const DATA_FRAME_START = Buffer.from([0x68]);
const DATA_FRAME_END = Buffer.from([0x16]);

/**
 * Transforms FT12 protocol stream to frames
 * @extends Transform
 * @example
 ```js
 const SerialPort = require('serialport');
 const port = new SerialPort('/dev/ttyUSB0', {
  "baudRate": 19200,
  "dataBits": 8,
  "stopBits": 1,
  "parity": "even"
 });
 const FT12Parser = require('./FT12parser');
 const parser = new FT12Parser();
 port.pipe(parser);
 parser.on('data', console.log);
 ```

 */
class FT12Parser extends Transform {
  constructor(options) {
    super(options);
    this.buffer = Buffer.alloc(0);
  }

  _transform(chunk, encoding, cb) {
    let data = Buffer.concat([this.buffer, Buffer.from(chunk)]);
    // console.log("______transform", data);
    //while (data.length > 0) {
      if (data.length >= ACK_FRAME_LENGTH) {
        if (data.slice(0, ACK_FRAME_LENGTH).compare(ACK_FRAME) === 0) {
          this.push(ACK_FRAME);
          data = data.slice(ACK_FRAME_LENGTH);
        }
      }
      if (data.length >= FIXED_FRAME_LENGTH) {
        if (data.slice(0, FIXED_FRAME_LENGTH).compare(FIXED_FRAME_RESET_IND) === 0) {
          this.push(FIXED_FRAME_RESET_IND);
          data = data.slice(FIXED_FRAME_LENGTH);
        }
      }

      if (data.length > FIXED_FRAME_LENGTH) {
        if (data.slice(0, 1).compare(DATA_FRAME_START) === 0 && data.slice(3, 4).compare(DATA_FRAME_START) === 0) {
          let DATA_L_BYTE = data.readUInt8(1);
          // [START_BYTE LENGTH_BYTE LENGTH_BYTE START_BYTE] [CR] [DATA + C] END_BYTE
          let expectedLength = 4 + 1 + DATA_L_BYTE + 1;
          if (data.length >= expectedLength) {
            let lastByte = data.slice(expectedLength - 1, expectedLength);
            if (lastByte.compare(DATA_FRAME_END) === 0) {
              let dataFrame = data.slice(0, expectedLength);
              this.push(dataFrame);
              data = data.slice(expectedLength);
              this.buffer = data;
            }
          }
        } else {
          // console.log("_____else");
          data = data.slice(1);
          // console.log("____data", data);
        }
      }
    //}
    this.buffer = data;
    cb();
  }

  _flush(cb) {
    // console.log("_____flush");
    this.push(this.buffer);
    this.buffer = Buffer.alloc(0);
    cb();
  }
}

module.exports = FT12Parser;
