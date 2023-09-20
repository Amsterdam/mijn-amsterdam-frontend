import crypto from 'crypto';
import {
  add,
  format,
  parseISO,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  sub,
  subQuarters,
} from 'date-fns';
import { Request, Response } from 'express';
import { IS_AP, IS_TAP } from '../../universal/config';
import { defaultDateFormat } from '../../universal/helpers';
import { db } from './db/db';

/**
 * This service gives us the ability to count the exact amount of visitors that logged in into Mijn Amsterdam over start - end period.
 */

const SALT = process.env.BFF_LOGIN_COUNT_SALT;
const QUERY_DATE_FORMAT = 'yyyy-MM-dd';

const queriesSQLITE = (tableNameLoginCount: string) => ({
  countLogin: `INSERT INTO ${tableNameLoginCount} (uid, auth_method) VALUES (?, ?)`,
  totalLogins: `SELECT count(id) as count FROM ${tableNameLoginCount} WHERE DATE(date_created) BETWEEN ? AND ? AND auth_method = ?`,
  totalLoginsAll: `SELECT count(id) as count FROM ${tableNameLoginCount} WHERE DATE(date_created) BETWEEN ? AND ?`,
  uniqueLogins: `SELECT uid, count(uid) FROM ${tableNameLoginCount} WHERE DATE((date_created) BETWEEN ? AND ? AND auth_method = ? GROUP BY uid`,
  uniqueLoginsAll: `SELECT uid, count(uid) as count FROM ${tableNameLoginCount} WHERE DATE(date_created) BETWEEN ? AND ? GROUP BY uid`,
  dateMinAll: `SELECT min(date_created) as date_min FROM ${tableNameLoginCount}`,
  dateMaxAll: `SELECT max(date_created) as date_max FROM ${tableNameLoginCount}`,
});

const queriesPG = (tableNameLoginCount: string) => ({
  countLogin: `INSERT INTO ${tableNameLoginCount} (uid, "authMethod") VALUES ($1, $2) RETURNING id`,
  totalLogins: `SELECT count(id) FROM ${tableNameLoginCount} WHERE "authMethod"=$2 AND $1::daterange @> date_created::date`, // NOTE: can be another, faster query if we'd have millions of records
  totalLoginsAll: `SELECT count(id) FROM ${tableNameLoginCount} WHERE $1::daterange @> date_created::date`, // NOTE: can be another, faster query if we'd have millions of records
  uniqueLogins: `SELECT uid, count(uid) FROM ${tableNameLoginCount} WHERE "authMethod"=$2 AND $1::daterange @> date_created::date GROUP BY uid`,
  uniqueLoginsAll: `SELECT uid, count(uid) FROM ${tableNameLoginCount} WHERE $1::daterange @> date_created::date GROUP BY uid`,
  dateMinAll: `SELECT min(date_created) as date_min FROM ${tableNameLoginCount}`,
  dateMaxAll: `SELECT max(date_created) as date_max FROM ${tableNameLoginCount}`,
});

async function getQueries() {
  const { tableNameLoginCount } = await db();
  return (IS_AP ? queriesPG : queriesSQLITE)(tableNameLoginCount);
}

function hashUserId(userID: string, salt = SALT) {
  if (!salt) {
    throw new Error('No salt provided');
  }

  const shasum = crypto.createHash('sha256');
  shasum.update(userID + salt);
  return shasum.digest('hex');
}

export async function countLoggedInVisit(
  userID: string,
  authMethod: AuthMethod = 'digid'
) {
  const userIDHashed = hashUserId(userID);
  const queries = await getQueries();
  const { query } = await db();
  return query(queries.countLogin, [userIDHashed, authMethod]);
}

export async function loginStats(req: Request, res: Response) {
  if (!IS_TAP && !process.env.BFF_LOGIN_COUNT_TABLE) {
    return res.send(
      'Supply database credentials and enable your Datapunt VPN to use this view locally.'
    );
  }

  const queries = await getQueries();
  const { queryGET, tableNameLoginCount } = await db();

  let authMethodSelected = '';

  if (['yivi', 'eherkenning', 'digid'].includes(req.params.authMethod)) {
    authMethodSelected = req.params.authMethod;
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

  const dateMinResult = (await queryGET(queries.dateMinAll)) as {
    date_min: string;
  };

  const dateMaxResult = (await queryGET(queries.dateMaxAll)) as {
    date_max: string;
  };

  let dateMin: Date | null = null;
  let dateMax: Date | null = null;

  if (dateMinResult) {
    dateMin = parseISO(dateMinResult.date_min);
  }

  if (dateMaxResult) {
    dateMax = parseISO(dateMaxResult.date_max);
  }

  let dateStart: string = dateMin
    ? format(dateMin, QUERY_DATE_FORMAT)
    : dateEndday;

  let dateEnd: string = dateMax
    ? format(dateMax, QUERY_DATE_FORMAT)
    : dateEndday;

  if (dateStart === dateEnd) {
    dateEnd = format(add(parseISO(dateEnd), { days: 1 }), QUERY_DATE_FORMAT);
  }

  let totalLogins = 0;
  let uniqueLogins = 0;

  if (req.query.dateStart) {
    dateStart = req.query.dateStart as string;
  }

  if (req.query.dateEnd) {
    dateEnd = req.query.dateEnd as string;
  }

  let params: Array<string | Date> = [dateStart, dateEnd];
  let totalQuery = queries.totalLoginsAll;
  let uniqueQuery = queries.uniqueLoginsAll;

  // Refine select statement with an authMethod type
  if (authMethodSelected) {
    totalQuery = queries.totalLogins;
    uniqueQuery = queries.uniqueLogins;
    params.push(authMethodSelected);
  }

  const totalLoginsResult = (await queryGET(totalQuery, params)) as {
    count: number;
  };

  if (totalLoginsResult) {
    totalLogins = totalLoginsResult.count;
  }

  const uniqueLoginsResult = (await queryGET(uniqueQuery, params)) as {
    count: number;
  };

  if (uniqueLoginsResult) {
    uniqueLogins = uniqueLoginsResult.count;
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
    tableNameLoginCount,
    authMethodSelected,
  });
}
