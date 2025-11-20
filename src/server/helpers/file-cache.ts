import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { FlatCache, clearCacheById, create } from 'flat-cache';

import { IS_AP } from '../../universal/config/env';
import { ONE_SECOND_MS } from '../config/app';

interface FileCacheProps {
  name: string;
  path?: string;
  cacheTimeMinutes?: number;
  triesUntilConsiderdStale?: number;
}

type KeyData<T = unknown> = {
  expire: number | false;
  data: T;
};

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
          const fileCache = create({
            cacheDir: DEFAULT_CACHE_DIR,
            cacheId: fileName(name),
          });
          return {
            name,
            env,
            keys: fileCache.keys().map((key) => {
              const keyData = fileCache.get<KeyData>(key);
              const overview: Record<string, unknown> = {
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

const DEFAULT_TRIES_UNTIL_CONSIDERED_STALE = 5;
export default class FileCache {
  name: string;
  cache: FlatCache;
  expire: number | false;
  hashes: string[];
  triesUntilConsiderdStale: number;

  constructor({
    name,
    cacheTimeMinutes = 0,
    triesUntilConsiderdStale = DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
  }: FileCacheProps) {
    this.name = fileName(name);
    this.expire =
      cacheTimeMinutes === -1 ? false : cacheTimeMinutes * ONE_MINUTE_MS;
    this.cache = create({
      cacheDir: DEFAULT_CACHE_DIR,
      cacheId: this.name,
    });
    this.hashes = [];
    this.triesUntilConsiderdStale = triesUntilConsiderdStale;
  }

  getKey<T = unknown>(key: string): T | undefined {
    const now = new Date().getTime();
    const value = this.cache.get<KeyData<T>>(key);

    if (value === undefined || (value.expire !== false && value.expire < now)) {
      return undefined;
    }
    return value.data;
  }

  setKey(key: string, value: unknown) {
    const now = new Date().getTime();
    this.cache.set(key, {
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
        .map((k) => this.cache.get<KeyData>(k).data)
        .join()
    );
    const generatedHash = hash.digest('hex');

    this.hashes.push(generatedHash);
  }

  remove() {
    clearCacheById(this.name, DEFAULT_CACHE_DIR);
    this.hashes = [];
  }

  getKeyStale<T>(key: string, isProd: boolean = IS_AP) {
    return create({
      cacheDir: DEFAULT_CACHE_DIR,
      cacheId: fileName(key, isProd),
    }).get<KeyData<T>>(key)?.data;
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
