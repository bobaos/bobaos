const port = 49199;

const io = require('socket.io')(port);

export function start(app) {
  console.log("starting socketio custom script");
  io.on('connection', (socket) => {
    // socket.monitor('timeConnected', Date.now());
    socket.on('baos.value.set.req', data => {
      if (data) {
        //logger.info('socket value.set.req:', data);
        app.setDatapoint(data.name, data.value);
        // now get it from baos so event listeners will react
        app.getDatapoint(data.name);
        socket.emit('baos.value.set.res', data);
      }
    });
    socket.on('baos.value.get.req', data => {
      if (data) {
        //logger.info('socket value.get.req:', data);
        let res = data;
        res.value = app.store.get(data.name);
        // logger.info('socket baos.value.get.res:', res);
        socket.emit('baos.value.get.res', res);
      }
    })
  });

  app.on('value', (payload) => {
    let service = payload.service;
    if (service === 'DatapointValue.Ind' || service === 'GetDatapointValue.Res') {
      let datapoint = payload.datapoint;
      let name = datapoint.name;
      let id = datapoint.id;
      let value = payload.value;
      io.emit('baos.value.ind', {name: name, id: id, value: value});
    }
  });
}