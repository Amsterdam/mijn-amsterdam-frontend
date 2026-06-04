import { sql } from 'drizzle-orm';
import { index, jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import type {
  ConsumerId,
  NotificationsService,
  ServiceId,
} from '../../amsapp/notifications/amsapp-notifications-types.ts';

export const NOTIFICATIONS_TABLE_NAME = 'bff_notifications';
export const NOTIFICATIONS_CONSUMER_DETAILS_TABLE_NAME =
  'bff_notification_consumer_details';

export const notificationsTable = pgTable(
  NOTIFICATIONS_TABLE_NAME,
  {
    id: varchar('id', { length: 64 }).notNull().primaryKey(),
    profileId: varchar('profile_id', { length: 43 }).notNull(),
    profileName: varchar('profile_name', { length: 200 }),
    serviceIds: varchar('service_ids', { length: 50 })
      .array()
      .$type<ServiceId[]>()
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
    lastLoginDate: timestamp('last_login_date', { withTimezone: true }),
  },
  (table) => [index('bff_notifications_date_created_idx').on(table.dateCreated)]
);

export const notificationsConsumerDetailsTable = pgTable(
  NOTIFICATIONS_CONSUMER_DETAILS_TABLE_NAME,
  {
    consumerId: varchar('consumer_id', { length: 100 })
      .$type<ConsumerId>()
      .notNull()
      .primaryKey(),
    notificationRowId: varchar('notification_row_id', {
      length: 64,
    })
      .notNull()
      .references(() => notificationsTable.id, { onDelete: 'cascade' }),
    loginExpiryDate: timestamp('login_expiry_date', {
      withTimezone: true,
    })
      .notNull()
      .default(sql`NOW() + INTERVAL '3 months'`),
  },
  (table) => [
    index('bff_notification_consumer_details_notification_row_id_idx').on(
      table.notificationRowId
    ),
    index('bff_notification_consumer_details_login_expiry_date_idx').on(
      table.loginExpiryDate
    ),
  ]
);
