import crypto from 'crypto';
import os from 'os';
import FileCache from '../helpers/file-cache';
import { Request, Response } from 'express';

/**
 * This service is an initial POC to count the unique logins per userID. This gives us the ability to use this stat
 * as a kpi. Currently the data lives in a cache which gets deleted everytime a new version of the application is deployed.
 * Also the application os loadbalanced so the stats are divided between multiple disks. A proper solution would require a database + backup functionality.
 */

const SALT = process.env.BFF_LOGIN_COUNT_SALT;

const fileCache = new FileCache({
  name: 'visitors',
  cacheTimeMinutes: -1,
});

function hashUserId(userID: string, salt = SALT) {
  if (!salt) {
    throw new Error('No salt provided');
  }

  const shasum = crypto.createHash('sha256');
  shasum.update(userID + salt);
  return shasum.digest('hex');
}

export function countLoggedInVisit(userID: string) {
  const userIDHashed = hashUserId(userID);
  const countStatsCache = fileCache.getKey('stats');

  if (!countStatsCache) {
    const countStats = {
      [userIDHashed]: 1,
    };
    fileCache.setKey('stats', countStats);
    fileCache.setKey('dateCreated', new Date().toISOString());
  } else {
    countStatsCache[userIDHashed] = (countStatsCache[userIDHashed] ?? 0) + 1;
    fileCache.setKey('dateModified', new Date().toISOString());
    fileCache.setKey('stats', countStatsCache);
  }

  fileCache.save();
}

export function loginStats(req: Request, res: Response) {
  let totalLogins = 0;
  let uniqueLogins = 0;

  const stats: Record<string, number> = fileCache.getKey('stats') || null;

  if (stats) {
    totalLogins = Object.values(stats).reduce(
      (total, count) => total + (count ?? 0),
      0
    );
    uniqueLogins = Object.keys(stats).length;
  }

  return res.send({
    server: os.hostname(),
    dateCreated: fileCache.getKey('dateCreated') || null,
    dateModified: fileCache.getKey('dateModified') || null,
    totalLogins,
    uniqueLogins,
  });
}
