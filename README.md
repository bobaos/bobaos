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
6. You may start using bobaos with [bobaos-datapoint-sdk](https://github.com/shabunin/bobaos-datapoint-sdk)

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
  // get server item
  app
    .getServerItem(1, 17)
    .then(data => {
      console.log('got server item 1-17', data)
    })
    .catch(e => {
      console.log('err', e);
    });
  app.getServerItem(17, 20)
    .then(data => {
      console.log('got server item 17-20', data);
    })
    .catch(e => {
      console.log('err', e);
    });

  // now get datapoint description
  app.getDatapointDescription(1, 30)
    .then(data => {
      console.log('got datapoint description 1-30', data);
    })
    .catch(data => {
      console.log('err while getting datapoint description 1-30', data);
    });
  // in my case it returns error cause no datapoints was configured
  app.getDatapointDescription(349, 10)
    .then(data => {
      console.log('got datapoint description 349-359', data);
    })
    .catch(data => {
      console.log('err while getting datapoint description 349-359', data);
    });
});

// listen to reset event
app.on('reset', _ => {
  console.log('got reset indication');
});

// listen to indication events
app.on('DatapointValue.Ind', (data) => {
  console.log('got datapoint value indication: ', data);
});

app.on('ServerItem.Ind', (data) => {
  console.log('got server item indication: ', data);
});
``` 

For more details look at example/ folder.

The values in request/response are buffers and you should use some library to decode/encode values. I suggest [knx-dpts-baos](https://github.com/shabunin/knx-dpts-baos).

# API

The communication between Host(RPi) and ObjectServer(Baos module) in this module version implemented in request-response model.
Requests are sent by following methods and returns Promise instance, so you are able to use Promise API.

Currently, this module supports following methods:

**getServerItem(id, [number = 1])**

Get server information like hardware/firmware version, serial number, bus connected state, etc.

Request example:
```js
// set programming mode to true
app.getServerItem(1, 17)
.then(data => {
  console.log('get server item 1-17: success', data);
})
.catch(err => {
  console.log('get server item 1-17: error', err);
});
```

Response example:

```
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
 { id: 17, length: 1, value: <Buffer 01> } ]
```

**setServerItem(id, value)**

Set server item value. Value param should be instance of Buffer.

Example:
```js
// set programming mode to true
app.setServerItem(15, Buffer.alloc(1, 0x01))
.then(_ => {
  console.log('set programming mode: success');
})
.catch(err => {
  console.log('set programming mode: error', err);
});
```

**getDatapointDescription(id, [number = 1])**

Get description for datapoints. Response includes value type(length), config flags, datapoint type.

Request example:
```js
// set programming mode to true
app.getDatapointDescription(1, 3)
.then(data => {
  console.log('get datapoint description 1 - 3: success', data);
})
.catch(err => {
  console.log('get datapoint description 1 - 3: error', err);
});
```
Response example:
    
```
[ { id: 1, length: 2, flags: { priority: "low", communication: true, read: true, write: false, readOnInit: false, transmit: true, update: true }, dpt: 'dpt9' },
{ id: 2, length: 1, flags: { priority: "low", communication: true, read: true, write: false, readOnInit: false, transmit: true, update: true}, dpt: 'dpt5' },
{ id: 3, length: 1, flags: { priority: "low", communication: true, read: true, write: false, readOnInit: false, transmit: true, update: true}, dpt: 'dpt5' } ]
```

**setDatapointValue(id, value)**
  
Set and send datapoint value to bus. Value should be Buffer encoded.

Example:
```js
// set programming mode to true
app.setDatapointValue(1, Buffer.alloc(1, 0x01))
.then(_ => {
  console.log('set datapoint 1 value: success');
})
.catch(err => {
  console.log('set datapoint 1 value: error', err);
});
```

**readDatapointFromBus(id, length)**

Send read request to KNX bus. 
    
Example:
```js
// set programming mode to true
app.readDatapointFromBus(1, 1)
.then(_ => {
  console.log('read datapoint 1 from bus: success');
})
.catch(err => {
  console.log('read datapoint 1 from bus: error', err);
});
```

    
**getDatapointValue(id, [number = 1])**
    
Get datapoints value from baos.
    
Response example:
    
```
[ { id: 1, state: { transmissionStatus: "Idle/OK", readRequestFlag: false, updateFlag: false, validFlag: false }, length: 2, value: <Buffer 0c fb> },
 { id: 2, state: { transmissionStatus: "Idle/OK", readRequestFlag: false, updateFlag: false, validFlag: false }, length: 1, value: <Buffer c0> },
 { id: 3, state: { transmissionStatus: "Idle/OK", readRequestFlag: false, updateFlag: false, validFlag: false }, length: 1, value: <Buffer 10> },
 { id: 4, state: { transmissionStatus: "Idle/OK", readRequestFlag: false, updateFlag: false, validFlag: false }, length: 1, value: <Buffer 00> } ]
```

**getParameterByte(id, [number = 1])**

Get parameter bytes starting with id number.

Request example:
```js
// set programming mode to true
app.getParameterByte(1, 10)
.then(data => {
  console.log('get parameter byte 1 - 10: success', data);
})
.catch(err => {
  console.log('get parameter byte 1 - 10: error', err);
});
```    
    
Response example:
    
```
<Buffer 01 03 05 07 09 0b 0a 00 00 00>
```

# Useful cases

1. DIY home controller. 
    * write your own scripts in JS
    * use rich npm infrastructure to integrate with different services
    
2. As a gateway to other systems. For example, you may use it with [homebridge](https://github.com/nfarina/homebridge) to add HomeKit support to your KNX bus.

# Demo
[My presentation at TADHack 2017](https://www.youtube.com/watch?v=vBXVysVJymc)

[Apple HomeKit integration](https://www.youtube.com/watch?v=6K-xG2r9YwI)
