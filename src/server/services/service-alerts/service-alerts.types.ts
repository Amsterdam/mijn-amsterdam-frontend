import z from 'zod';

import {
  SERVICE_ALERT_DISPLAY_LOCATIONS,
  SERVICE_ALERT_ENVIRONMENTS,
  SERVICE_ALERT_TYPES,
} from '../db/schema/service-alerts.ts';

export const serviceAlertLinkInput = z
  .object({
    label: z.string().max(200),
    url: z.url().max(2048),
    sortOrder: z.number().int(),
  })
  .strict();

export type ServiceAlertLinkInput = z.infer<typeof serviceAlertLinkInput>;

export const serviceAlertInput = z
  .object({
    id: z.string().max(64).optional(),
    title: z.string().max(200),
    body: z.string(),
    type: z.enum(SERVICE_ALERT_TYPES).default('info'),
    displayLocation: z.enum(SERVICE_ALERT_DISPLAY_LOCATIONS),
    links: z.array(serviceAlertLinkInput).default([]),
    environments: z.array(z.enum(SERVICE_ALERT_ENVIRONMENTS)).default([]),
    dateStart: z.iso.datetime(),
    dateEnd: z.iso.datetime().nullable().optional(),
  })
  .strict();

export type ServiceAlertInput = z.infer<typeof serviceAlertInput>;
