import { ConnectionManager } from 'typeorm';
import { models } from '@mewchan/common';

const connectionManager = new ConnectionManager();
connectionManager.create({
  name: 'reika',
  type: 'postgres',
  url: process.env.DB_URL,
  // @ts-ignore
  entities: models
});

export default connectionManager;
