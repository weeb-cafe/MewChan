import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

export { ms } from './ms';
export { default as createLogger } from './logger';
export * from './Queue';

export const halt = (time: number) => new Promise<void>(r => setTimeout(r, time));
export const resolveFromESModule = (mod: any) => {
  if (typeof mod !== 'object') return mod;
  if (mod.default) return mod.default;
  const values = Object.values(mod);
  if (values.length === 0) return null;
  else if (values.length === 1) return values[0];
  return mod;
};

export function parseEnv(path?: string): { [key: string]: string } | never {
  path = path
    ? (existsSync(path) ? path : join(process.cwd(), path))
    : join(process.cwd(), '.env');

  let items;

  try {
    items = readFileSync(path, 'utf8')
      .replace(/ /g, '')
      .split('\n')
      .filter(e => e.includes('='));
  } catch {
    throw new Error(`Path "${path}" is invalid.`);
  }

  const final: { [key: string]: string } = {};

  for (const item of items) {
    const data = item.split('=');
    const name = data.splice(0, 1)[0];
    const value = data.join('=');

    final[name] = value;
  }

  return final;
}

export function readdirRecursive(directory: string) {
  const result = [];

  (function read(dir) {
    const files = readdirSync(dir);

    for (const file of files) {
      const filepath = join(dir, file);

      if (statSync(filepath).isDirectory()) read(filepath);
      else result.push(filepath);
    }
  })(directory);

  return result;
}
