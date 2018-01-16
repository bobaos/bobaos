const Baos = require('../');

const app = new Baos({debug: false});

app.on('open', function () {
  app
    .getDatapointDescription(1, 10)
    // .getParameterByte(1, 10)
    // .readDatapointFromBus(1, 1) // error
    // .readDatapointFromBus(1, 2)
    // .getDatapointValue(1, 10)
    // .setDatapointValue(2, Buffer.alloc(1, 0xc0))
    // .getDatapointValue(2);
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
  console.log(data.payload)
});
