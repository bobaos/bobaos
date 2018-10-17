const Baos = require('../');
const app = new Baos({serialPort: {device: '/dev/ttyAMA0'}, debug: false});

// send requests after successful initial reset
app.on('open', async _ => {
  try {
    console.log("example: serialport opened");
    // get server item
    console.log('>> set prog mode to 1');
    await app.setServerItem(15, Buffer.alloc(1, 0x01));
    console.log('>> get server item 1-17');
    console.log(await app.getServerItem(1, 17));
    console.log('>> get server item 17-20');
    console.log(await app.getServerItem(17, 20));
    // console.log('>> get datapoint description 1-5');
    // console.log(await app.getDatapointDescription(1, 5));
    // console.log('>> get datapoint description 349 (!error)');
    // console.log(await app.getDatapointDescription(349));
    console.log('>> set prog mode to 0');
    await app.setServerItem(15, Buffer.alloc(1, 0x00));
    console.log('>> get parameter byte 1-10');
    console.log(await app.getParameterByte(1, 10));

    // close serialport then open it again and again
    app.closeSerialPort(err => {
      if (err) {
        console.log(err.message);

        return;
      }

      console.log("serialport closed");
      app.openSerialPort();
    });

  } catch (e) {
    console.log(`Error with requests: ${e.message}`);
  }
});

// listen to incoming events and responses
app.on('reset', _ => {
  console.log('got reset indication');
});

app.on('DatapointValue.Ind', (data) => {
  // event listener. data is
  console.log('got datapoint value indication: ', data);
});

app.on('ServerItem.Ind', (data) => {
  // event listener. data is
  console.log('got server item indication: ', data);
});


