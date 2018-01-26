# bobaos-project

Hello, friend.

I would like to introduce you bobaos-project, JavaScript library implementing [KNX ObjectServer Protocol](https://www.weinzierl.de/images/download/development/830/KnxBAOS_Protocol_v2.pdf) for [KNX BAOS Module 838 kBerry](https://www.weinzierl.de/index.php/en/all-knx/knx-module-en/knx-baos-module-838-en).

The main purpose of project is to bring modern JavaScript with it's infrastructure into KNX and world of BAOS.

# Installation

1. Prepare your Raspberry Pi: install raspbian, enable ssh. Or you could download my image [here](https://drive.google.com/file/d/14nKNbaQfCUN9Mu7cFc5JTicbgbWo06kt/view?usp=sharing). In this case you should go directly to step 5. Image is based on 2017-11-29-raspbian-stretch-lite with installed nodejs 8, vim, git, enabled ssh and correct config.txt, cmdline.txt.
 
2. Install [KNX BAOS Module 838 kBerry](https://www.weinzierl.de/index.php/en/all-knx/knx-module-en/knx-baos-module-838-en) shield.

3. [Set up serial port](https://github.com/weinzierl-engineering/baos/blob/master/docs/Raspbian.adoc#kberry)
  
4. Install nodejs, git
```sh
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

5. Test with [bobaos-cli](https://github.com/shabunin/bobaos-cli)

```sh
sudo npm install -g bobaos-cli
bobaos-cli
```

# Using with your application

Add this module to your nodejs application:
```sh
npm install --save bobaos
```

Define in js file:
```js
  const Baos = require('bobaos');
  const app = new Baos({serialPort: {device: '/dev/ttyAMA0'}, debug: false});
  // send requests after successful initial reset
  app.on('open', () => {
    app
      .getDatapointDescription(1, 10)
      .getParameterByte(1, 10)
      .readDatapointFromBus(1, 2) // good
      .readDatapointFromBus(1, 10) // error!
      .getDatapointValue(1, 10)
      .setDatapointValue(2, Buffer.alloc(1, 0xc0))
      .getDatapointValue(2);
  });

  // listen to incoming events and responses
  app.on('service', console.log);
``` 

The output should looks like this with disabled debug option
```
{ service: 'GetParameterByte.Res',
  error: false,
  start: 1,
  number: 10,
  payload: <Buffer 01 03 05 07 09 0b 0a 00 00 00> }
{ service: 'SetDatapointValue.Res',
  error: false,
  start: 1,
  number: 0,
  payload: null }
{ service: 'GetDatapointValue.Res',
  error: false,
  start: 1,
  number: 1,
  payload: [ { id: 1, state: 4, length: 2, value: <Buffer 0c fb> } ] }
  ....
  ....
```

For more details look at example/ folder.

The values in request/response are buffers and you should use some library to decode/encode values. I suggest [knx-dpts-baos](https://github.com/shabunin/knx-dpts-baos).

# API

The communication between Host(RPi) and ObjectServer(Baos module) in this module implemented as request-event model.
So, all requests should be send by provided methods as getDatapointDescription, etc and all response data should be handled by callback on 'service' event.

Currently, this module supports following methods:

**getServerItem(id, [number = 1])**

Get server information like hardware/firmware version, serial number, bus connected state, etc.

Response example:

```
{ service: 'GetServerItem.Res',
  direction: 'response',
  error: false,
  start: 1,
  number: 17,
  payload:
   [ { id: 1, length: 6, value: <Buffer 00 00 c5 08 00 03> },
     { id: 2, length: 1, value: <Buffer 10> },
     { id: 3, length: 1, value: <Buffer 12> },
     { id: 4, length: 2, value: <Buffer 00 c5> },
     { id: 5, length: 2, value: <Buffer 00 c5> },
     { id: 6, length: 2, value: <Buffer 08 05> },
     { id: 7, length: 1, value: <Buffer 10> },
     { id: 8, length: 6, value: <Buffer 00 c5 01 01 76 b7> },
     { id: 9, length: 4, value: <Buffer 04 9a c1 ee> },
     { id: 10, length: 1, value: <Buffer 01> },
     { id: 11, length: 2, value: <Buffer 00 fa> },
     { id: 12, length: 2, value: <Buffer 00 00> },
     { id: 13, length: 1, value: <Buffer 01> },
     { id: 14, length: 2, value: <Buffer 00 fa> },
     { id: 15, length: 1, value: <Buffer 00> },
     { id: 16, length: 1, value: <Buffer 20> },
     { id: 17, length: 1, value: <Buffer 01> } ] }
```

**setServerItem(id, value)**

Set server item value. Value param should be instance of Buffer.

Example:
```js
// set programming mode to true
app.setServerItem(15, Buffer.alloc(1, 0x01));
```

Response:
```
{ service: 'SetServerItem.Res',
  direction: 'response',
  error: false,
  start: 15,
  number: 0,
  payload: null }
```

**getDatapointDescription(id, [number = 1])**

Get description for datapoints. Response includes value type(length), config flags, datapoint type.

Response example:
    
```
{ service: 'GetDatapointDescription.Res',
  direction: 'response',
  error: false,
  start: 1,
  number: 10,
  payload: 
    [ { id: 1, length: 2, flags: { priority: "low", communication: true, read: true, write: false, readOnInit: false, transmit: true, update: true }, dpt: 'dpt9' },
    { id: 2, length: 1, flags: { priority: "low", communication: true, read: true, write: false, readOnInit: false, transmit: true, update: true}, dpt: 'dpt5' },
    { id: 3, length: 1, flags: { priority: "low", communication: true, read: true, write: false, readOnInit: false, transmit: true, update: true}, dpt: 'dpt5' } ] }
```

**setDatapointValue(id, value)**
  
Set and send datapoint value to bus. Value should be Buffer encoded.
    
Response example:
    
```
{ service: 'SetDatapointValue.Res',
  direction: 'response',
  error: false,
  start: 2,
  number: 0,
  payload: null }
```

**readDatapointFromBus(id, length)**

Send read request to KNX bus. 
    
Response example:

```
{ service: 'SetDatapointValue.Res',
  direction: 'response',
  error: false,
  start: 1,
  number: 0,
  payload: null }
```
    
**getDatapointValue(id, [number = 1])**
    
Get datapoints value from baos.
    
Response example:
    
```
{ service: 'GetDatapointValue.Res',
  direction: 'response',
  error: false,
  start: 1,
  number: 10,
  payload: 
   [ { id: 1, state: { transmissionStatus: "Idle/OK", readRequestFlag: false, updateFlag: false, validFlag: false }, length: 2, value: <Buffer 0c fb> },
     { id: 2, state: { transmissionStatus: "Idle/OK", readRequestFlag: false, updateFlag: false, validFlag: false }, length: 1, value: <Buffer c0> },
     { id: 3, state: { transmissionStatus: "Idle/OK", readRequestFlag: false, updateFlag: false, validFlag: false }, length: 1, value: <Buffer 10> },
     { id: 4, state: { transmissionStatus: "Idle/OK", readRequestFlag: false, updateFlag: false, validFlag: false }, length: 1, value: <Buffer 00> } ] }
```

**getParameterByte(id, [number = 1])**

Get parameter bytes starting with id number.
    
Response example:
    
```
{ service: 'GetParameterByte.Res',
  direction: 'response',
  error: false,
  start: 1,
  number: 10,
  payload: <Buffer 01 03 05 07 09 0b 0a 00 00 00> }
```

# Useful cases

1. DIY home controller. 
    * write your own scripts in JS
    * use rich npm infrastructure to integrate with different services
    
2. As a gateway to other systems. For example, you may use it with [homebridge](https://github.com/nfarina/homebridge) to add HomeKit support to your KNX bus.

# Demo
[My presentation at TADHack 2017](https://www.youtube.com/watch?v=vBXVysVJymc)

[Apple HomeKit integration](https://www.youtube.com/watch?v=6K-xG2r9YwI)

# TODO:
1. **DONE** npm package
2. More services support
