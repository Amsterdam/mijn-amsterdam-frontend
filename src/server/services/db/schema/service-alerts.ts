import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const SERVICE_ALERTS_TABLE_NAME = 'bff_service_alerts';

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

export type ServiceAlertLink = {
  label: string;
  url: string;
  sortOrder: number;
};

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
    displayLocation: varchar('display_location', { length: 20 })
      .$type<ServiceAlertDisplayLocation>()
      .notNull(),
    themaId: varchar('thema_id', { length: 64 }),
    createdByEmail: varchar('created_by_email', { length: 320 }),
    updatedByEmail: varchar('updated_by_email', { length: 320 }),
    links: jsonb('links').$type<ServiceAlertLink[]>().notNull().default([]),
    environments: varchar('environments', { length: 10 })
      .array()
      .$type<ServiceAlertEnvironment[]>()
      .notNull()
      .default([]),
    dateStart: timestamp('date_start', { withTimezone: true }).notNull(),
    dateEnd: timestamp('date_end', { withTimezone: true }).notNull(),
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
  ]
);
