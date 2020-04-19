import { parseEnv } from '@reika/common';
process.env = Object.assign(process.env, parseEnv());

process.env.NODE_ENV = process.env.NODE_ENV ?? 'DEVELOPMENT';
