import redisClient = require('ioredis');

export default new redisClient({
  host: process.env.REDIS_HOST ?? 'localhost',
  db: Number(process.env.REDIS_DB),
  password: process.env.REDIS_PASSWORD
});
