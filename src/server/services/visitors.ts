import crypto from 'crypto';
import {
  add,
  format,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  sub,
  subQuarters,
} from 'date-fns';
import { Request, Response } from 'express';
import { IS_AP } from '../../universal/config';
import { defaultDateFormat } from '../../universal/helpers';
import { query, tableNameLoginCount } from './db';

/**
 * This service gives us the ability to count the exact amount of visitors that logged in into Mijn Amsterdam over start - end period.
 */

const SALT = process.env.BFF_LOGIN_COUNT_SALT;
const QUERY_DATE_FORMAT = 'yyyy-MM-dd';

const queries = {
  countLogin: `INSERT INTO ${tableNameLoginCount} (uid) VALUES ($1) RETURNING id`,
  totalLogins: `SELECT count(id) FROM ${tableNameLoginCount} WHERE $1::daterange @> date_created::date`, // NOTE: can be another, faster query if we'd have millions of records
  uniqueLogins: `SELECT uid, count(uid) FROM ${tableNameLoginCount} WHERE $1::daterange @> date_created::date GROUP BY uid`,
  dateMinAll: `SELECT min(date_created) as date_min FROM ${tableNameLoginCount}`,
  dateMaxAll: `SELECT max(date_created) as date_max FROM ${tableNameLoginCount}`,
};

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
  return query(queries.countLogin, [userIDHashed]);
}

export async function loginStats(req: Request, res: Response) {
  if (!IS_AP && !process.env.BFF_LOGIN_COUNT_TABLE) {
    return res.send(
      'Supply database credentials and enable your Datapunt VPN to use this view locally.'
    );
  }
  const today = new Date();
  const dateEndday = format(today, QUERY_DATE_FORMAT);
  const ranges = [
    {
      label: 'Vandaag',
      dateStart: today,
      dateEnd: add(today, { days: 1 }),
    },
    {
      label: 'Gister',
      dateStart: sub(today, { days: 1 }),
      dateEnd: sub(today, { days: 1 }),
    },
    {
      label: 'Deze week',
      dateStart: startOfWeek(today),
      dateEnd: today,
    },
    {
      label: 'Vorige week',
      dateStart: sub(startOfWeek(today), { weeks: 1 }),
      dateEnd: sub(startOfWeek(today), { days: 1 }),
    },
    {
      label: 'Deze maand',
      dateStart: startOfMonth(today),
      dateEnd: today,
    },
    {
      label: 'Vorige maand',
      dateStart: sub(startOfMonth(today), { months: 1 }),
      dateEnd: sub(startOfMonth(today), { days: 1 }),
    },
    {
      label: 'Dit kwartaal',
      dateStart: startOfQuarter(today),
      dateEnd: today,
    },
    {
      label: 'Vorig kwartaal',
      dateStart: subQuarters(startOfQuarter(today), 1),
      dateEnd: sub(startOfQuarter(today), { days: 1 }),
    },
    {
      label: 'Dit jaar',
      dateStart: startOfYear(today),
      dateEnd: today,
    },
    {
      label: 'Afgelopen jaar',
      dateStart: startOfYear(sub(today, { years: 1 })),
      dateEnd: sub(startOfYear(today), { days: 1 }),
    },
  ].map((r) => {
    return {
      ...r,
      dateStart: r.dateStart && format(r.dateStart, QUERY_DATE_FORMAT),
      dateEnd: r.dateEnd && format(r.dateEnd, QUERY_DATE_FORMAT),
    };
  });

  const dateMinResult = await query(queries.dateMinAll);
  const dateMaxResult = await query(queries.dateMaxAll);

  let dateMin: Date | null = null;
  let dateMax: Date | null = null;

  if (dateMinResult?.rowCount) {
    dateMin = dateMinResult.rows[0].date_min;
  }

  if (dateMaxResult?.rowCount) {
    dateMax = dateMaxResult.rows[0].date_max;
  }

  let dateStart: string = dateMin
    ? format(dateMin, QUERY_DATE_FORMAT)
    : dateEndday;
  let dateEnd: string = dateMax
    ? format(dateMax, QUERY_DATE_FORMAT)
    : dateEndday;
  let totalLogins = 0;
  let uniqueLogins = 0;

  if (req.query.dateStart) {
    dateStart = req.query.dateStart as string;
  }

  if (req.query.dateEnd) {
    dateEnd = req.query.dateEnd as string;
  }

  const totalLoginsResult = await query(queries.totalLogins, [
    `[${dateStart}, ${dateEnd}]`,
  ]);

  if (totalLoginsResult?.rowCount) {
    totalLogins = parseInt(totalLoginsResult.rows[0].count, 10);
  }

  const uniqueLoginsResult = await query(queries.uniqueLogins, [
    `[${dateStart}, ${dateEnd}]`,
  ]);

  if (uniqueLoginsResult?.rowCount) {
    uniqueLogins = uniqueLoginsResult.rowCount;
  }

  return res.render('login-count', {
    dateMin,
    dateMax,
    totalLogins,
    uniqueLogins,
    dateStart,
    dateEnd,
    ranges,
    defaultDateFormat,
  });
}
