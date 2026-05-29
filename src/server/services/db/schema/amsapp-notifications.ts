import { index, jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import type { NotificationsService } from '../../amsapp/notifications/amsapp-notifications-types.ts';

export const NOTIFICATIONS_TABLE_NAME = 'bff_notifications';

export const notificationsTable = pgTable(
  NOTIFICATIONS_TABLE_NAME,
  {
    id: varchar('id', { length: 64 }).notNull().primaryKey(),
    profileId: varchar('profile_id', { length: 43 }).notNull(),
    profileName: varchar('profile_name', { length: 200 }),
    consumerIds: varchar('consumer_ids', { length: 100 })
      .array()
      .notNull()
      .default([]),
    serviceIds: varchar('service_ids', { length: 50 })
      .array()
      .notNull()
      .default([]),
    content: jsonb('content').$type<{
      services?: Record<string, NotificationsService>;
    } | null>(),
    dateUpdated: timestamp('date_updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
    dateCreated: timestamp('date_created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastLoginDate: varchar('last_login_date', { length: 200 }),
  },
  (table) => [
    index('bff_notifications_date_created_idx').on(table.dateCreated),
    index('bff_notifications_consumer_ids_gin_idx').using(
      'gin',
      table.consumerIds
    ),
  ]
);
