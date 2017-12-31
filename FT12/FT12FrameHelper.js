class FT12FrameHelper {
  static composeFrame(data, count) {
    let buff = Buffer.alloc(0);
    const startByte = 0x68;
    const endByte = 0x16;
    const controlByte = count === 'odd' ? 0x73 : 0x53;
    const lengthByte = data.length + 1;
    // checksum
    let sum = data.reduce((a, b) => a + b, 0) + controlByte;
    let checksum = sum % 256;
    buff = Buffer.concat([buff, Buffer.alloc(1, startByte)]);
    buff = Buffer.concat([buff, Buffer.alloc(1, lengthByte)]);
    buff = Buffer.concat([buff, Buffer.alloc(1, lengthByte)]);
    buff = Buffer.concat([buff, Buffer.alloc(1, startByte)]);
    buff = Buffer.concat([buff, Buffer.alloc(1, controlByte)]);
    // data
    buff = Buffer.concat([buff, Buffer.from(data)]);
    // ending
    buff = Buffer.concat([buff, Buffer.alloc(1, checksum)]);
    buff = Buffer.concat([buff, Buffer.alloc(1, endByte)]);
    //this.log("_ft12_helper_composeFrame: ", buff);
    //this._ft12.port.write(buff);
    //this._ft12.switchFrameCount();
    return buff;
  }

  static processFrame(data) {
    let startByte1 = data.readUInt8(0);
    let startByte2 = data.readUInt8(3);
    let lengthByte1 = data.readUInt8(1);
    let lengthByte2 = data.readUInt8(2);
    let controlByte = data.readUInt8(4);
    let checkSum = data.readUInt8(data.length - 2);
    let endByte = data.readUInt8(data.length - 1);
    let message = data.slice(5, data.length - 2);
    if (startByte1 === startByte2 && lengthByte1 === lengthByte2 && endByte === 0x16) {
      return message;
    } else {
      throw new Error('Invalid data frame', data);
    }
  }
}

module.exports = FT12FrameHelper;