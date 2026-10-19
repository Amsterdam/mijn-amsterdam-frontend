import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const ADMIN_ACCOUNTS_TABLE_NAME = 'bff_admin_accounts';

export const adminAccountsTable = pgTable(ADMIN_ACCOUNTS_TABLE_NAME, {
  username: varchar('username', { length: 320 }).notNull().primaryKey(),
  jiraApiToken: varchar('jira_api_token', { length: 512 })
    .notNull()
    .default(''),
  lastSignInDate: timestamp('last_sign_in_date', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});
