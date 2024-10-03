import fs from 'fs';
import { createHash } from 'node:crypto';
import path from 'path';

import { Cache, clearCacheById, create } from 'flat-cache';

import { IS_AP } from '../../universal/config/env';
import { ONE_SECOND_MS } from '../config/app';

interface FileCacheProps {
  name: string;
  path?: string;
  cacheTimeMinutes?: number;
  triesUntilConsiderdStale?: number;
}

const ONE_MINUTE_MS = ONE_SECOND_MS * 60;
const EXT = 'flat-cache.json';

export const DEFAULT_CACHE_DIR = path.join(__dirname, '../', 'cache');

function fileName(name: string, isProd: boolean = IS_AP) {
  const cacheName = isProd ? `prod.${name}` : `dev.${name}`;
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
          const fileCache = create(fileName(name), DEFAULT_CACHE_DIR);
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

const defaultTriesUntilConsiderdStale = 5;
export default class FileCache {
  name: string;
  name_: string;
  path?: string;
  cache: Cache;
  expire: number | false;
  hashes: string[];
  triesUntilConsiderdStale: number;

  constructor({
    name,
    path = DEFAULT_CACHE_DIR,
    cacheTimeMinutes = 0,
    triesUntilConsiderdStale = defaultTriesUntilConsiderdStale,
  }: FileCacheProps) {
    this.name = fileName(name);
    this.path = path;
    this.name_ = name;
    this.cache = create(this.name, path);
    this.expire =
      cacheTimeMinutes === -1 ? false : cacheTimeMinutes * ONE_MINUTE_MS;
    this.hashes = [];
    this.triesUntilConsiderdStale = triesUntilConsiderdStale;
  }

  getKey(key: string) {
    const now = new Date().getTime();
    const value = this.cache.getKey(key);

    if (value === undefined || (value.expire !== false && value.expire < now)) {
      return undefined;
    } else {
      return value.data;
    }
  }

  setKey(key: string, value: any) {
    const now = new Date().getTime();
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

    const hash = createHash('sha256');

    // generate a new hash using the data field of all cached items and store the hash
    hash.update(
      this.cache
        .keys()
        .map((k) => this.cache.getKey(k).data)
        .join()
    );
    const generatedHash = hash.digest('hex');

    this.hashes.push(generatedHash);
  }

  remove() {
    clearCacheById(this.name, this.path);
    this.hashes = [];
  }

  getKeyStale(key: string, isProd: boolean = IS_AP) {
    return create(fileName(this.name_, isProd), this.path).getKey(key)?.data;
  }

  isStale() {
    if (this.hashes.length >= this.triesUntilConsiderdStale) {
      // check if the latest n hashes are the same, if so we consider this stale
      return (
        new Set(
          this.hashes.slice(this.hashes.length - this.triesUntilConsiderdStale)
        ).size === 1
      );
    }

    return false;
  }
}
