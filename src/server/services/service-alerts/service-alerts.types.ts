import z from 'zod';

import type { MyNotification } from '../../../universal/types/App.types.ts';
import {
  SERVICE_ALERT_DISPLAY_LOCATIONS,
  SERVICE_ALERT_TYPES,
  type ServiceAlertDisplayLocation,
  type ServiceAlertType,
} from '../db/schema/service-alerts.ts';
import type { ServiceAlertRow } from './service-alerts.model.ts';

export const serviceAlertLinkInput = z
  .object({
    label: z.string().trim().min(1).max(200),
    url: z.url({ protocol: /^https$/ }).max(2048),
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

type ServiceAlertDateKey =
  | 'dateStart'
  | 'dateEnd'
  | 'dateUpdated'
  | 'dateCreated';

export type ServiceAlertsOverview = Array<
  Omit<ServiceAlertRow, ServiceAlertDateKey> &
    Record<ServiceAlertDateKey, string>
>;

export type ServiceAlert = MyNotification & {
  title: string;
  datePublished: string;
  dateStart: string;
  dateEnd: string;
  timeEnd: string;
  timeStart: string;
  description: string;
  severity: ServiceAlertType;
  displayLocation: ServiceAlertDisplayLocation;
};

export type QueryParamsServiceAlerts = {
  page?: string;
};
