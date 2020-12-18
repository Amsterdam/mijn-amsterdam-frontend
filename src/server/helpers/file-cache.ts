import flatCache from 'flat-cache';
import path, { resolve } from 'path';
import fs from 'fs';
import { rejects } from 'assert';
import { IS_AP } from '../../universal/config';

interface FileCacheProps {
  name: string;
  path?: string;
  cacheTimeMinutes?: number;
}

const ONE_MINUTE_MS = 1000 * 60;
const EXT = 'flat-cache.json';

export const DEFAULT_CACHE_DIR = path.join(__dirname, '../', 'cache');

function fileName(name: string) {
  const cacheName = IS_AP ? `prod.${name}` : `dev.${name}`;
  return `${cacheName}.${EXT}`;
}

export function cacheOverview() {
  return new Promise((resolve, reject) => {
    fs.readdir(DEFAULT_CACHE_DIR, (error, names) => {
      if (error) {
        reject(error);
      }
      const overview = names
        .filter((name) => name.endsWith(`.${EXT}`))
        .map((file) => {
          const [env, name] = file.split('.');
          const fileCache = flatCache.load(fileName(name), DEFAULT_CACHE_DIR);
          return {
            name,
            env,
            keys: fileCache.keys().map((key) => {
              const keyData = fileCache.getKey(key);
              const overview: Record<string, string | boolean> = {
                key,
                expire: keyData.expire
                  ? new Date(keyData.expire).toISOString()
                  : false,
              };
              if (key === 'url') {
                overview.url = keyData.data;
              }
              return overview;
            }),
          };
        });
      resolve(overview);
    });
  });
}

export default class FileCache {
  name: string;
  path?: string;
  cache: any;
  expire: number | false;

  constructor({
    name,
    path = DEFAULT_CACHE_DIR,
    cacheTimeMinutes = 0,
  }: FileCacheProps) {
    this.name = fileName(name);
    this.path = path;
    this.cache = flatCache.load(this.name, path);
    this.expire =
      cacheTimeMinutes === -1 ? false : cacheTimeMinutes * ONE_MINUTE_MS;
  }
  getKey(key: string) {
    var now = new Date().getTime();
    var value = this.cache.getKey(key);

    if (value === undefined || (value.expire !== false && value.expire < now)) {
      return undefined;
    } else {
      return value.data;
    }
  }
  setKey(key: string, value: any) {
    var now = new Date().getTime();
    this.cache.setKey(key, {
      expire: this.expire === false ? false : now + this.expire,
      data: value,
    });
  }
  removeKey(key: string) {
    this.cache.removeKey(key);
  }
  save() {
    this.cache.save(true);
  }
  remove() {
    flatCache.clearCacheById(this.name, this.path);
  }
}
