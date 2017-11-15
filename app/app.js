import Baos from '../lib/baos';

const serialPortConfig = require('../config/serialPort.json');
const datapoints = require('../config/datapoints.json');
import logger from '../lib/logger';
import * as scripts from '../scripts';


let app = new Baos({
  serialPortConfig: serialPortConfig
});

app.importDatapoints(datapoints);

app.on('reset', () => logger.info('reset'));

app.on('open', function () {
  const readAllDatapoints = () => {
    app.datapoints.forEach((item) => {
      if (item.read) {
        app.readDatapointById(item.id);
      }
      app.getDatapointById(item.id);
    });
  };

  // now our app
  // store datapoint values
  app.store = {};
  app.store.values = datapoints.map(datapoint => {
    return {
      name: datapoint.name,
      id: datapoint.id,
      type: datapoint.type,
      value: null
    }
  });
  app.store.get = (name) => {
    const findByName = item => item.name === name;
    let findIndex = app.store.values.findIndex(findByName);
    if (findIndex >= 0) {
      return app.store.values[findIndex].value;
    } else {
      return null;
    }
  };

  app.store.set = (name, value) => {
    const findByName = item => item.name === name;
    let findIndex = app.store.values.findIndex(findByName);
    if (findIndex >= 0) {
      app.store.values[findIndex].value = value;
    } else {
      return null;
    }
  };


// now listener that writes to store
  app.on('value', (payload) => {
    logger.info('myClient', payload);
    let service = payload.service;
    if (service === 'DatapointValue.Ind' || service === 'GetDatapointValue.Res') {
      let datapoint = payload.datapoint;
      let name = datapoint.name;
      let value = payload.value;
      logger.info('store set', name, value);
      app.store.set(name, value);
    }
  });
});


// load custom scripts
Object.keys(scripts).forEach((plugin) => {
  console.dir(plugin);
  if (scripts[plugin].hasOwnProperty("start")) {
    scripts[plugin].start(app);
  }
});