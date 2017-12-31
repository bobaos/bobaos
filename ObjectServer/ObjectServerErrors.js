'use strict';

const Errors = [
  {code: 0x00, description: 'No error'},
  {code: 0x01, description: 'Internal error'},
  {code: 0x02, description: 'No element found'},
  {code: 0x03, description: 'Buffer is too small'},
  {code: 0x04, description: 'Item is not writable'},
  {code: 0x05, description: 'Service is not supported'},
  {code: 0x06, description: 'Bad service parameter'},
  {code: 0x07, description: 'Bad ID'},
  {code: 0x08, description: 'Bad command/value'},
  {code: 0x09, description: 'Bad length'},
  {code: 0x0a, description: 'Message inconsistent'},
  {code: 0x0b, description: 'Object server is busy'},
];

module.exports = Errors;