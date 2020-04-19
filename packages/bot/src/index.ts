import { parseEnv } from '@reika/common';
process.env = Object.assign(process.env, parseEnv());

process.env.NODE_ENV = process.env.NODE_ENV ?? 'DEVELOPMENT';

import ReikaClient from './client/ReikaClient';
const client = new ReikaClient();

client
  .on('error', err => client.logger.error(err.message, { topic: 'DISCORD ERROR' }))
  .on('shardError', (err, id) => client.logger.error(err.message, { topic: `DISCORD Shard ${id} ERROR` }))
  .on('warn', info => client.logger.warn(info, { topic: 'DISCORD WARN' }));

client.start();
