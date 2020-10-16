import React from 'react';
import { dateSort } from '../../universal/helpers/date';
import { AppState, PRISTINE_APPSTATE, createAllErrorState } from '../AppState';
import {
  WelcomeNotification,
  MaintenanceNotification01,
} from '../config/staticData';
import * as Sentry from '@sentry/browser';
import { DocumentLink } from '../components/DocumentList/DocumentList';

function transformNotifications(NOTIFICATIONS: AppState['NOTIFICATIONS']) {
  if (NOTIFICATIONS.status === 'OK') {
    NOTIFICATIONS.content.push(WelcomeNotification);
    if (new Date() <= new Date('2020-09-22T12:00:00')) {
      NOTIFICATIONS.content.push(MaintenanceNotification01);
    }
    NOTIFICATIONS.content.sort(dateSort('datePublished', 'desc'));
  }
  return NOTIFICATIONS;
}

export function transformAppState(data: Partial<AppState> | null) {
  // Copy the pristine content to the error content so we keep our
  // pristine data state but with error status.
  if (data && typeof data === 'object') {
    const appStateKeys = Object.keys(data) as Array<keyof typeof data>;
    for (const key of appStateKeys) {
      if (data[key] && data[key]?.status === 'ERROR') {
        if (data[key]?.content === null) {
          data[key]!.content =
            PRISTINE_APPSTATE[key].content || data[key]!.content;
        }
      }
    }

    if ('NOTIFICATIONS' in data) {
      data['NOTIFICATIONS'] = transformNotifications(data.NOTIFICATIONS!);
    }

    if (data.FOCUS_SPECIFICATIES?.content) {
      if (data.FOCUS_SPECIFICATIES?.content.jaaropgaven) {
        data.FOCUS_SPECIFICATIES.content.jaaropgaven = data.FOCUS_SPECIFICATIES?.content.jaaropgaven.map(
          document => {
            const documentUrl = (
              <DocumentLink document={document} label="PDF" />
            );
            return Object.assign(document, { documentUrl });
          }
        );
      }
      if (data.FOCUS_SPECIFICATIES?.content.uitkeringsspecificaties) {
        data.FOCUS_SPECIFICATIES.content.uitkeringsspecificaties = data.FOCUS_SPECIFICATIES?.content.uitkeringsspecificaties.map(
          document => {
            const documentUrl = (
              <DocumentLink document={document} label="PDF" />
            );
            return Object.assign(document, { documentUrl });
          }
        );
      }
    }

    return data;
  }

  Sentry.captureMessage(
    '[transformAppState] Data returned from server is not an object',
    {
      extra: {
        data,
      },
    }
  );

  return createAllErrorState(PRISTINE_APPSTATE, 'Received invalid appState');
}
