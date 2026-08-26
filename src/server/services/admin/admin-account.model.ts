import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import type { AccountData, AccountUpdateInput } from './admin-account.types.ts';
import { defaultDateTimeFormat } from '../../../universal/helpers/date.ts';
import { getPool } from '../db/postgres.ts';
import { adminAccountsTable } from '../db/schema/admin-accounts.ts';

function getDrizzleDb() {
  return drizzle(getPool());
}

type AccountRow = {
  username: string;
  jiraApiToken: string;
  lastSignInDate: Date;
};

function ensureRow(row: AccountRow | undefined): AccountRow {
  if (!row) {
    throw new Error('No account row returned from database');
  }

  return row;
}

function toAccountData(row: AccountRow): AccountData {
  return {
    username: row.username,
    jiraApiToken: row.jiraApiToken,
    lastSignInDate: defaultDateTimeFormat(row.lastSignInDate),
  };
}

const accountSelect = {
  username: adminAccountsTable.username,
  jiraApiToken: adminAccountsTable.jiraApiToken,
  lastSignInDate: adminAccountsTable.lastSignInDate,
};

export async function getAccountData(
  username: string
): Promise<AccountData | null> {
  const drizzleDb = getDrizzleDb();

  const rows = await drizzleDb
    .select(accountSelect)
    .from(adminAccountsTable)
    .where(eq(adminAccountsTable.username, username))
    .limit(1);

  const [row] = rows;
  return row ? toAccountData(ensureRow(row)) : null;
}

export async function getOrCreateAccountData(
  username: string,
  now: Date = new Date()
): Promise<AccountData> {
  const drizzleDb = getDrizzleDb();

  const [row] = await drizzleDb
    .insert(adminAccountsTable)
    .values({
      username,
      lastSignInDate: now,
    })
    .onConflictDoUpdate({
      target: adminAccountsTable.username,
      set: {
        lastSignInDate: now,
      },
    })
    .returning(accountSelect);

  return toAccountData(ensureRow(row));
}

export async function updateAccountData(
  username: string,
  update: AccountUpdateInput,
  now: Date = new Date()
): Promise<AccountData> {
  const drizzleDb = getDrizzleDb();

  const existing = await drizzleDb
    .select(accountSelect)
    .from(adminAccountsTable)
    .where(eq(adminAccountsTable.username, username))
    .limit(1);

  if (existing.length === 0) {
    const [inserted] = await drizzleDb
      .insert(adminAccountsTable)
      .values({
        username,
        jiraApiToken: update.jiraApiToken,
        lastSignInDate: now,
      })
      .returning(accountSelect);

    return toAccountData(ensureRow(inserted));
  }

  const [updated] = await drizzleDb
    .update(adminAccountsTable)
    .set({
      jiraApiToken: update.jiraApiToken,
    })
    .where(eq(adminAccountsTable.username, username))
    .returning(accountSelect);

  return toAccountData(ensureRow(updated));
}
