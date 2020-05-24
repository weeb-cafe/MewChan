import { parseEnv } from '@mewchan/common';
// Env probs loaded in a different way
if (!process.env.DISCORD_TOKEN) process.env = Object.assign(process.env, parseEnv());
process.env.NODE_ENV = process.env.NODE_ENV ?? 'production';

import './struct/extend';
import MewchanClient from './client/MewchanClient';
import { TOPICS } from './util/Constants';
const client = new MewchanClient();

client
  .on('error', err => client.logger.error(err.stack ?? err.message, { topic: TOPICS.DISCORD.ERROR() }))
  .on('shardError', (err, id) => client.logger.error(err.stack ?? err.message, { topic: TOPICS.DISCORD.ERROR(id) }))
  .on('warn', info => client.logger.warn(info, { topic: TOPICS.DISCORD.WARN }));

void client.start();
