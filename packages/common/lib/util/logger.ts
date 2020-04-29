import { createLogger, format, transports } from 'winston';
import WSTransport from '@weeb-cafe/winston-ws';

export default async (name: string) => createLogger({
  format: format.combine(
    format.errors({ stack: true }),
    format.label({ label: name.toUpperCase() }),
    format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
    format.printf(info => {
      const { timestamp, label, level, message, topic, ...rest } = info;
      return `[${timestamp}][${label}][${level.toUpperCase()}][${topic}]: ${message}${
        Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ''
      }`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.colorize({ level: true }),
      level: 'info'
    }),
    await new WSTransport({
      format: format.combine(format.timestamp(), format.json()),
      level: 'debug'
    }).init(process.env.LOGGER_HOST!, process.env.LOGGER_ID!, process.env.LOGGER_TOKEN!) as any
  ]
});
