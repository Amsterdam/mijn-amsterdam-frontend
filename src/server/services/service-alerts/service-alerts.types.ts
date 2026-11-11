import z from 'zod';

import { isHttpsUrl } from '../../../universal/helpers/url.ts';
import {
  SERVICE_ALERT_DISPLAY_LOCATIONS,
  SERVICE_ALERT_ENVIRONMENTS,
  SERVICE_ALERT_TYPES,
} from '../db/schema/service-alerts.ts';

export const serviceAlertLinkInput = z
  .object({
    label: z.string().trim().min(1).max(200),
    url: z.url().max(2048).refine(isHttpsUrl),
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
    themaId: z.string().max(64).nullable().optional(),
    links: z.array(serviceAlertLinkInput).default([]),
    environments: z.array(z.enum(SERVICE_ALERT_ENVIRONMENTS)).default([]),
    dateStart: z.iso.datetime(),
    dateEnd: z.iso.datetime(),
  })
  .superRefine(({ displayLocation, themaId }, context) => {
    if (displayLocation === 'theme' && !themaId) {
      context.addIssue({
        code: 'custom',
        message: 'A theme must be selected for theme alerts.',
        path: ['themaId'],
      });
    }
  })
  .strict();

export type ServiceAlertInput = z.infer<typeof serviceAlertInput>;

export type ServiceAlertsOverview = {
  id: string;
  title: string;
  body: string;
  type: (typeof SERVICE_ALERT_TYPES)[number];
  displayLocation: (typeof SERVICE_ALERT_DISPLAY_LOCATIONS)[number];
  themaId: string | null;
  createdByEmail: string | null;
  updatedByEmail: string | null;
  links: ServiceAlertLinkInput[];
  environments: (typeof SERVICE_ALERT_ENVIRONMENTS)[number][];
  dateStart: string;
  dateEnd: string;
}[];
