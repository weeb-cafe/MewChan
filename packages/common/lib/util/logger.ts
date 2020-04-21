import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export default (name: string, path?: string) => {
  path = path || join(process.cwd(), 'logs');

  if (!existsSync(path)) mkdirSync(path);

  return createLogger({
    format: format.combine(
      format.errors({ stack: true }),
      format.label({ label: `Reika ${name.toUpperCase()}` }),
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
      new DailyRotateFile({
        format: format.combine(format.timestamp(), format.json()),
        level: 'debug',
        dirname: path,
        filename: `${name}-%DATE%.log`,
        maxFiles: '14d'
      })
    ]
  });
};
