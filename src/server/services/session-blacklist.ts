import { sub } from 'date-fns';
import { Request, Response } from 'express';
import { OIDC_TOKEN_EXP, ONE_MINUTE_MS } from '../config';
import { IS_PG, tableNameSessionBlacklist } from './db/config';
import { db } from './db/db';
import { execDB } from './db/sqlite3';

const MIN_HOURS_TO_KEEP_SESSIONS_BLACKLISTED = OIDC_TOKEN_EXP + ONE_MINUTE_MS;

export const queriesPG = (tableNameSessionBlacklist: string) => ({
  addToBlackList: `INSERT INTO ${tableNameSessionBlacklist} (session_id) VALUES ($1) RETURNING id`,
  isBlacklisted: `SELECT EXISTS(SELECT 1 FROM ${tableNameSessionBlacklist} WHERE session_id = $1) AS count`,
  cleanupSessionIds: `DELETE FROM ${tableNameSessionBlacklist} WHERE date_created <= $1`,
  rawOverview: `SELECT * FROM ${tableNameSessionBlacklist} ORDER BY date_created ASC`,
});

export const queriesSQLITE = (tableNameSessionBlacklist: string) => ({
  addToBlackList: `INSERT INTO ${tableNameSessionBlacklist}  (session_id) VALUES (?)`,
  isBlacklisted: `SELECT EXISTS(SELECT 1 FROM ${tableNameSessionBlacklist} WHERE session_id = ?) AS count`,
  cleanupSessionIds: `DELETE FROM ${tableNameSessionBlacklist} WHERE date_created <= ?`,
  rawOverview: `SELECT * FROM ${tableNameSessionBlacklist} ORDER BY date_created ASC`,
});

function getQueries() {
  return (IS_PG ? queriesPG : queriesSQLITE)(tableNameSessionBlacklist);
}

const queries = getQueries();

async function setupTables() {
  const { query } = await db();

  if (IS_PG) {
    const createTableQuery = `
    -- Sequence and defined type
    CREATE SEQUENCE IF NOT EXISTS ${tableNameSessionBlacklist}_id_seq;

    -- Table Definition
    CREATE TABLE IF NOT EXISTS "public"."${tableNameSessionBlacklist}" (
        "id" int4 NOT NULL DEFAULT nextval('${tableNameSessionBlacklist}_id_seq'::regclass),
        "session_id" varchar(256) NOT NULL,
        "date_created" timestamp NOT NULL DEFAULT now(),
        PRIMARY KEY ("id")
    );
    `;

    await query(createTableQuery);
  } else {
    // Create the table
    try {
      execDB(`
      CREATE TABLE IF NOT EXISTS "${tableNameSessionBlacklist}" (
          "id" INTEGER PRIMARY KEY,
          "session_id" VARCHAR(256) NOT NULL,
          "date_created" DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
      );
    `);
    } catch (err) {
      console.error(err);
    }
  }
}

setupTables();

export async function cleanupSessionIds(
  minHoursToKeepSessionsBlacklisted: number = MIN_HOURS_TO_KEEP_SESSIONS_BLACKLISTED
) {
  const { query } = await db();
  // Deletes all session ids added to the blacklist more than $MIN_HOURS_TO_KEEP_SESSIONS_BLACKLISTED hours ago.
  const dateCreatedBefore = sub(new Date(), {
    hours: minHoursToKeepSessionsBlacklisted,
  }).toISOString();

  return query(queries.cleanupSessionIds, [dateCreatedBefore]);
}

export async function addToBlackList(sessionID: string) {
  const { query } = await db();
  return query(queries.addToBlackList, [sessionID]);
}

export async function isBlacklisted(sessionID: string) {
  const { queryGET } = await db();
  const result = (await queryGET(queries.isBlacklisted, [sessionID])) as {
    count: number;
  };

  return result ? !!result.count : false;
}

export async function sessionBlacklistTable(req: Request, res: Response) {
  const { queryALL } = await db();

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
