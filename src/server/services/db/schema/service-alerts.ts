import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const SERVICE_ALERTS_TABLE_NAME = 'bff_service_alerts';
export const SERVICE_ALERT_LINKS_TABLE_NAME = 'bff_service_alert_links';

export const SERVICE_ALERT_TYPES = ['warning', 'info', 'error'] as const;
export type ServiceAlertType = (typeof SERVICE_ALERT_TYPES)[number];

export const SERVICE_ALERT_DISPLAY_LOCATIONS = [
  'theme',
  'dashboard',
  'notification',
] as const;
export type ServiceAlertDisplayLocation =
  (typeof SERVICE_ALERT_DISPLAY_LOCATIONS)[number];

export const SERVICE_ALERT_ENVIRONMENTS = ['test', 'acc', 'prod'] as const;
export type ServiceAlertEnvironment =
  (typeof SERVICE_ALERT_ENVIRONMENTS)[number];

export const serviceAlertsTable = pgTable(
  SERVICE_ALERTS_TABLE_NAME,
  {
    id: varchar('id', { length: 64 }).notNull().primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    body: text('body').notNull(),
    type: varchar('type', { length: 20 })
      .$type<ServiceAlertType>()
      .notNull()
      .default('info'),
    displayLocations: varchar('display_locations', { length: 20 })
      .array()
      .$type<ServiceAlertDisplayLocation[]>()
      .notNull()
      .default([]),
    environments: varchar('environments', { length: 10 })
      .array()
      .$type<ServiceAlertEnvironment[]>()
      .notNull()
      .default([]),
    dateStart: timestamp('date_start', { withTimezone: true }).notNull(),
    dateEnd: timestamp('date_end', { withTimezone: true }),
    dateUpdated: timestamp('date_updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
    dateCreated: timestamp('date_created', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('bff_service_alerts_date_start_end_idx').on(
      table.dateStart,
      table.dateEnd
    ),
    index('bff_service_alerts_environments_gin_idx').using(
      'gin',
      table.environments
    ),
    index('bff_service_alerts_display_locations_gin_idx').using(
      'gin',
      table.displayLocations
    ),
  ]
);

export const serviceAlertLinksTable = pgTable(
  SERVICE_ALERT_LINKS_TABLE_NAME,
  {
    id: varchar('id', { length: 64 }).notNull().primaryKey(),
    serviceAlertId: varchar('service_alert_id', { length: 64 })
      .notNull()
      .references(() => serviceAlertsTable.id, { onDelete: 'cascade' }),
    label: varchar('label', { length: 200 }).notNull(),
    url: varchar('url', { length: 2048 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [
    index('bff_service_alert_links_service_alert_id_idx').on(
      table.serviceAlertId
    ),
  ]
);

export const serviceAlertsRelations = relations(
  serviceAlertsTable,
  ({ many }) => ({
    links: many(serviceAlertLinksTable),
  })
);

export const serviceAlertLinksRelations = relations(
  serviceAlertLinksTable,
  ({ one }) => ({
    serviceAlert: one(serviceAlertsTable, {
      fields: [serviceAlertLinksTable.serviceAlertId],
      references: [serviceAlertsTable.id],
    }),
  })
);
