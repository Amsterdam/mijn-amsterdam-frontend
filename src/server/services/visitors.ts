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
import { IS_TAP } from '../../universal/config/env';
import { defaultDateFormat } from '../../universal/helpers/date';
import { tableNameLoginCount } from './db/config';
import { db } from './db/db';
import { captureException } from './monitoring';

/**
 * This service gives us the ability to count the exact amount of visitors that logged in into Mijn Amsterdam over start - end period.
 */

const SALT = process.env.BFF_LOGIN_COUNT_SALT;
const QUERY_DATE_FORMAT = 'yyyy-MM-dd';

const queriesPG = (tableNameLoginCount: string) => ({
  countLogin: `INSERT INTO ${tableNameLoginCount} (uid, "authMethod") VALUES ($1, $2) RETURNING id`,
  totalLogins: `SELECT count(id) FROM ${tableNameLoginCount} WHERE "authMethod"=$3 AND date_created >= $1::date AND date_created <= $2::date`, // NOTE: can be another, faster query if we'd have millions of records
  totalLoginsAll: `SELECT count(id) FROM ${tableNameLoginCount} WHERE date_created >= $1::date AND date_created <= $2::date`, // NOTE: can be another, faster query if we'd have millions of records
  uniqueLogins: `SELECT count(distinct uid) as count FROM ${tableNameLoginCount} WHERE "authMethod"=$3 AND date_created >= $1::date AND date_created <= $2::date`,
  uniqueLoginsAll: `SELECT count(distinct uid) as count FROM ${tableNameLoginCount} WHERE date_created >= $1::date AND date_created <= $2::date`,
  dateMinAll: `SELECT min(date_created) as date_min FROM ${tableNameLoginCount}`,
  dateMaxAll: `SELECT max(date_created) as date_max FROM ${tableNameLoginCount}`,
  rawOverview: `SELECT uid, count(uid) as count, "authMethod" FROM ${tableNameLoginCount} WHERE "authMethod" IS NOT null GROUP BY "authMethod", uid ORDER BY "authMethod" ASC, count DESC, uid ASC`,
});

async function setupTables() {
  const { query } = await db();

  const createTableQuery = `
    -- Sequence and defined type
    CREATE SEQUENCE IF NOT EXISTS ${tableNameLoginCount}_id_seq;

    -- Table Definition
    CREATE TABLE IF NOT EXISTS "public"."${tableNameLoginCount}" (
        "id" int4 NOT NULL DEFAULT nextval('${tableNameLoginCount}_id_seq'::regclass),
        "uid" varchar(100) NOT NULL,
        "authMethod" varchar(100) NOT NULL,
        "date_created" timestamp NOT NULL DEFAULT now(),
        PRIMARY KEY ("id")
    );
    `;

  const alterTableQuery1 = `
      ALTER TABLE IF EXISTS "public"."${tableNameLoginCount}"
      ADD IF NOT EXISTS "authMethod" VARCHAR(100);
    `;

  await query(createTableQuery);
  await query(alterTableQuery1);
}

setupTables();

async function getQueries() {
  return queriesPG(tableNameLoginCount);
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
  const { queryGET } = await db();

  let authMethodSelected = '';

  if (['eherkenning', 'digid'].includes(req.params.authMethod)) {
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
    date_min: string | Date;
  };
  const dateMaxResult = (await queryGET(queries.dateMaxAll)) as {
    date_max: string | Date;
  };

  let dateMin: Date = sub(new Date(), { years: 1 });
  let dateMax: Date = new Date();

  try {
    if (dateMinResult.date_min) {
      dateMin =
        dateMinResult.date_min instanceof Date
          ? dateMinResult.date_min
          : parseISO(dateMinResult.date_min);
    }

    if (dateMaxResult.date_max) {
      dateMax =
        dateMaxResult.date_max instanceof Date
          ? dateMaxResult.date_max
          : parseISO(dateMaxResult.date_max);
    }
  } catch (error) {
    captureException(error, {
      properties: {
        dateMaxResult,
        dateMinResult,
      },
    });
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

export async function loginStatsTable(req: Request, res: Response) {
  const { queryALL } = await db();
  const queries = await getQueries();

  function generateHtmlTable(rows: any[]) {
    if (rows.length === 0) {
      return '<p>No data found.</p>';
    }

    const tableHeader = Object.keys(rows[0])
      .map((columnName) => `<th>${columnName}</th>`)
      .join('');

    const tableRows = rows
      .map(
        (row) =>
          `<tr>${Object.values(row)
            .map((value) => `<td>${value}</td>`)
            .join('')}</tr>`
      )
      .join('');

    const htmlTable = `
    <table border="1">
      <thead>
        <tr>${tableHeader}</tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

    return htmlTable;
  }

  // SQLite3 query to select all data from the specified table
  const query = queries.rawOverview;

  // Execute the query and retrieve the results
  const rows = (await queryALL(query)) as any[];

  // Generate and display the HTML table
  const htmlTable = generateHtmlTable(rows);

  return res.send(htmlTable);
}
