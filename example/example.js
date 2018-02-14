const Baos = require('../');
const app = new Baos({serialPort: {device: '/dev/ttyAMA0'}, debug: false});

// send requests after successful initial reset
app.on('open', () => {
  // get server item
  app
    .getServerItem(1, 17)
    .then(data => {
      console.log('got server item 1-17', data)
    })
    .catch(err => {
      console.log('error while getting server items 1-17', err);
    });
  app.getServerItem(17, 20)
    .then(data => {
      console.log('got server item 17-20', data);
    })
    .catch(err => {
      console.log('error while getting server items 17-20', err);
    });

  // now get datapoint description
  app.getDatapointDescription(1, 5)
    .then(data => {
      console.log('got datapoint descriptions 1-5', data);
    })
    .catch(err => {
      console.log('err while getting datapoint descriptions 1-5', err);
    });
  // in my case it returns error cause no datapoints was configured
  app.getDatapointDescription(349, 1)
    .then(data => {
      console.log('got datapoint description 349', data);
    })
    .catch(err => {
      console.log('err while getting datapoint description 349', err);
    });

  // set programming mode to 0
  app.setServerItem(150, Buffer.alloc(1, 0x00))
    .then(data => {
      console.log('ser server item: success');
    })
    .catch(err => {
      console.log('err while setting server item: error', err);
    });

  // parameter bytes
  app.getParameterByte(1, 10)
    .then(data => {
      console.log('get parameter byte 1 - 10: success', data)
    })
    .catch(err => {
      console.log('get parameter byte 1 - 10: error', err);
    })
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


