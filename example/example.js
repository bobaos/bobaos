const Baos = require('../');
const app = new Baos({serialPort: {device: '/dev/ttyAMA0'}, debug: false});
// send requests after successful initial reset
app.on('open', () => {
  app
    .getServerItem(1, 17)
    .then(data => {
      console.log("get ser item", data)
    });
  app.getServerItem(17, 20)
    .then(data => {
      console.log("get ser item 2", data);
    });
  app.getDatapointDescription(1, 30)
    .then(data => {
      console.log('success', data);
    })
    .catch(data => {
      console.log('err', data);
    });
  //err
  app.getDatapointDescription(349, 10)
    .then(data => {
      console.log('success', data);
    })
    .catch(data => {
      console.log('err', data);
    });
});

// listen to incoming events and responses
app.on('service', console.log);

app.on('reset', _ => {
  console.log('got reset indication');
});

app.on('service', (data) => {
  console.log('got service data from baos: ', data);
});
