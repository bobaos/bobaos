const {createLogger, format, transports} = require('winston');
const {combine, timestamp, label, printf} = format;

const consoleFormat = printf(info => {
  return `${info.timestamp} [${info.source}] ${info.level}: ${JSON.stringify(info.message)}`;
});

const logger = createLogger({
  level: 'debug',
  format: format.json(),
  transports: [
    new transports.Console({
      format: format.json()
    }),
    new transports.File({
      filename: './log/bobaos.log',
      format: format.json()
    })
  ]
});

export default logger;
