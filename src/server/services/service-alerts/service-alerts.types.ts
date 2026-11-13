import z from 'zod';

import { isHttpsUrl } from '../../../universal/helpers/url.ts';
import type { MyNotification } from '../../../universal/types/App.types.ts';
import {
  SERVICE_ALERT_DISPLAY_LOCATIONS,
  SERVICE_ALERT_TYPES,
  type ServiceAlertDisplayLocation,
  type ServiceAlertType,
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
    id: z.uuid().optional(),
    title: z.string().max(200),
    body: z.string(),
    type: z.enum(SERVICE_ALERT_TYPES),
    displayLocation: z.enum(SERVICE_ALERT_DISPLAY_LOCATIONS),
    themaId: z.string().max(64).nullable().optional(),
    links: z.array(serviceAlertLinkInput).default([]),
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
  createdByEmail: string;
  updatedByEmail: string;
  links: ServiceAlertLinkInput[];
  dateStart: string;
  dateEnd: string;
}[];

export type ServiceAlert = MyNotification & {
  title: string;
  datePublished: string;
  dateStart: string;
  dateEnd: string;
  timeEnd: string;
  timeStart: string;
  description: string;
  path: string;
  severity: ServiceAlertType;
  displayLocation: ServiceAlertDisplayLocation;
};

export type QueryParamsServiceAlerts = {
  page?: string;
};
