const Baos = require('../index');

const app = new Baos({debug: false});

app.on('open', function () {
  let serverBuffSize = 32000;
  let buff = Buffer.alloc(2);
  buff.writeUInt16BE(serverBuffSize, 0);
  app
    .setServerItem(14, buff)
    .getDatapointDescription(1, 100)
    // .getParameterByte(1, 10)
    // .readDatapointFromBus(1, 1) // error
    // .readDatapointFromBus(1, 2)
    // .getDatapointValue(1, 10)
    // .setDatapointValue(2, Buffer.alloc(2, 0xc0))
    .getDatapointValue(1, 1000)
    .getServerItem(1, 17)
    // now write buffer size

});

app.on('reset', function () {
  app
    .getDatapointDescription(1, 10)
    // .getParameterByte(1, 10)
    // .readDatapointFromBus(1, 1) // error
    // .readDatapointFromBus(1, 2)
    // .getDatapointValue(1, 10)
    // .setDatapointValue(2, Buffer.alloc(1, 0xc0))
    // .getDatapointValue(2);
});


app.on('service', (data) => {
  console.log(data);
});
