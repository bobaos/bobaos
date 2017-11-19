# bobaos project
---

Hello, friend.

I would like to introduce you "bobaos" project, JavaScript app, based on [KNX BAOS Module 838 kBerry](https://www.weinzierl.de/index.php/en/all-knx/knx-module-en/knx-baos-module-838-en) and [KNX ObjectServer Protocol](https://www.weinzierl.de/images/download/development/830/KnxBAOS_Protocol_v2.pdf).

The main purpose of application is to bring modern JavaScript with it's infrastructure into KNX and world of BAOS.

# Installation

1. Prepare your Raspberry Pi:
  * Install [KNX BAOS Module 838 kBerry](https://www.weinzierl.de/index.php/en/all-knx/knx-module-en/knx-baos-module-838-en) shield.
  * [Set up serial port](https://github.com/weinzierl-engineering/baos/blob/master/docs/Raspbian.adoc#kberry)
2. Clone this repository

```sh
git clone https://github.com/shabunin/bobaos.git
```
3. Install dependencies

```sh
cd bobaos/
npm install
```

It will install all npm dependencies as [serialport](https://github.com/node-serialport/node-serialport), winston logger, babel-cli.

4. Configuration

* Take a look at ./config/serialPort.json. If you are using Raspbian you, probably, won't need to change it.
* Configure ./config/datapoints.json according to your ETS project.

```json
[
  {
    "name": "Temperature",
    "id": 1, // datapoint id, from ETS project
    "type": "dpt9", // datapoint type
    "read": true // read flag, used on startup to read datapoint values
  },
  {
      "name": "White.Write",
      "id": 2,
      "type": "dpt5",
      "read": false
  }
]
```

Currently, only DPT1 (1bit), DPT5 (1byte int), DPT9 (2bytes float) are supported.

# Running

```sh
./node_modules/.bin/babel-node app/app.js 
```

For production it's better not to use babel-node, instead transpile it to different files.
# Adding custom scripts

For custom script example take a look to [scripts/socket.io/index.js](https://github.com/shabunin/bobaos/blob/master/scripts/socketio/index.js)

# TODO:
1. npm script to transpile ES2015
2. ...
3. PROFIT.