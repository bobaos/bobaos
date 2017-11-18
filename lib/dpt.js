// from value to bytes
// please note that we use knx datapoints
import logger from './logger';
// logging funcs
const info = (...args) => {
  let message = {
    source: "lib/dpt.js",
    data: args
  };
  logger.info(JSON.stringify(message))
};
const debug = (...args) => {
  let message = {
    source: "lib/dpt.js",
    data: args
  };
  logger.debug(JSON.stringify(message))
};
const error = (...args) => {
  let message = {
    source: "lib/dpt.js",
    data: args
  };
  logger.error(JSON.stringify(message))
};

class set {
  static dpt1(value) {
    return new Buffer([value & 1]);
  }
  
  static dpt5(value) {
    return new Buffer([value]);
  }
  
  static dpt6(value) {
    // TODO: dpt6
  }
  
  static dpt7(value) {
    let buffer = new Buffer(2);
    buffer[0] = value >> 8;
    buffer[1] = value & 0x00FF;
    return buffer;
  }
  
  static dpt8(value) {
    // TODO: dpt8
  }
  
  static dpt9(value) {
    let buffer = new Buffer(2);
    let v = value * 100;
    let exponent = 0;
    for (; v < -2048; v /= 2) {
      exponent += 1;
    }
    for (; v > 2047; v /= 2) {
      exponent += 1;
    }
    let m = Math.round(v) & 0x7FF;
    let msb = (exponent << 3 | m >> 8);
    if (value < 0) {
      msb = msb | 0x80;
    }
    buffer[0] = msb;
    buffer[1] = m;
    logger.info("encode: ", buffer);
    return buffer;
  }
}


// from buffer to value
class get {
  static dpt1(data) {
    if (data.length === 1) {
      return data[0] & 1;
    } else {
      logger.info("wrong payload length")
      
    }
  }
  
  static dpt5(data) {
    if (data.length === 1) {
      return data[0];
    } else {
      logger.info("wrong payload length")
    }
  }
  
  static dpt7(data) {
    if (data.length === 2) {
      return (data[0] << 8) + data[1];
    } else {
      logger.info("wrong payload length")
    }
  }
  
  static dpt8(data) {
    // TODO: dpt8
  }
  
  static dpt9(data) {
    if (data.length === 2) {
      let exponent = (data[0] & 0x78) >> 3;
      let mantissa = ((data[0] & 0x07) << 8) | (data[1]);
      let sign = 1;
      if (data[0] & 0x80) {
        return ((-2048 + mantissa) * 0.01) * Math.pow(2, exponent);
      } else {
        return (mantissa * 0.01) * Math.pow(2, exponent);
      }
    } else {
      logger.info("wrong payload length")
    }
  }
}

export {set, get}