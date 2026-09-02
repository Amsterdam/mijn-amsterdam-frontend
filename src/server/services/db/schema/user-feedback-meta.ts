import {
  integer,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const USER_FEEDBACK_META_TABLE_NAME = 'user_feedback_meta';

export const userFeedbackMetaTable = pgTable(
  USER_FEEDBACK_META_TABLE_NAME,
  {
    id: serial('id').primaryKey(),
    entryId: integer('entry_id').notNull(),
    dateCreated: timestamp('date_created', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    dateModified: timestamp('date_modified', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    jiraTicketNumber: varchar('jira_ticket_number', { length: 64 }),
    departmentName: varchar('department_name', { length: 255 }),
    departmentEmail: varchar('department_email', { length: 320 }),
  },
  (table) => [
    uniqueIndex('user_feedback_meta_entry_id_unique').on(table.entryId),
  ]
);
