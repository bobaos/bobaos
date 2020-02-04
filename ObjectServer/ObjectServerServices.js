'use strict';

const Services = [];


Services.push({
  name: 'GetServerItem.Req',
  main: 0xf0,
  sub: 0x01,
  direction: 'request'
});
Services.push({
  name: 'GetServerItem.Res',
  main: 0xf0,
  sub: 0x81,
  direction: 'response'
});
Services.push({
  name: 'ServerItem.Ind',
  main: 0xf0,
  sub: 0xc2,
  direction: 'indication'
});

Services.push({
  name: 'SetServerItem.Req',
  main: 0xf0,
  sub: 0x02,
  direction: 'request'
});
Services.push({
  name: 'SetServerItem.Res',
  main: 0xf0,
  sub: 0x82,
  direction: 'response'
});

Services.push({
  name: 'GetDatapointValue.Req',
  main: 0xf0,
  sub: 0x05,
  direction: 'request'
});
Services.push({
  name: 'GetDatapointValue.Res',
  main: 0xf0,
  sub: 0x85,
  direction: 'response'
});
Services.push({
  name: 'DatapointValue.Ind',
  main: 0xf0,
  sub: 0xc1,
  direction: 'indication'
});

Services.push({
  name: 'SetDatapointValue.Req',
  main: 0xf0,
  sub: 0x06,
  direction: 'request'
});
Services.push({
  name: 'SetDatapointValue.Res',
  main: 0xf0,
  sub: 0x86,
  direction: 'response'
});

Services.push({
  name: 'GetDatapointDescription.Req',
  main: 0xf0,
  sub: 0x03,
  direction: 'request'
});
Services.push({
  name: 'GetDatapointDescription.Res',
  main: 0xf0,
  sub: 0x83,
  direction: 'response'
});

Services.push({
  name: 'GetParameterByte.Req',
  main: 0xf0,
  sub: 0x07,
  direction: 'request'
});
Services.push({
  name: 'GetParameterByte.Res',
  main: 0xf0,
  sub: 0x87,
  direction: 'response'
});

Services.push({
  name: 'GetDescriptionString.Req',
  main: 0xf0,
  sub: 0x04,
  direction: 'request'
});


Services.push({
  name: 'GetDescriptionString.Res',
  main: 0xf0,
  sub: 0x84,
  direction: 'response'
});

module.exports = Services;
