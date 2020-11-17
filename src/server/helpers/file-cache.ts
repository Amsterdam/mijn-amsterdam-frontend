import flatCache from 'flat-cache';
import path from 'path';

interface FileCacheProps {
  name: string;
  path?: string;
  cacheTimeMinutes?: number;
}

const ONE_MINUTE_MS = 1000 * 60;
export const DEFAULT_CACHE_DIR = path.join(__dirname, '../', 'mock-data/json');

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
    this.name = name;
    this.path = path;
    this.cache = flatCache.load(name, path);
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
