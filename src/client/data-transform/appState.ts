import { dateSort } from '../../universal/helpers/date';
import { AppState, PRISTINE_APPSTATE, createAllErrorState } from '../AppState';
import { WelcomeNotification } from '../config/staticData';
import * as Sentry from '@sentry/browser';

function transformNotifications(NOTIFICATIONS: AppState['NOTIFICATIONS']) {
  if (NOTIFICATIONS.status === 'OK') {
    NOTIFICATIONS.content.push(WelcomeNotification);
    NOTIFICATIONS.content.sort(dateSort('datePublished', 'desc'));
  }
  return NOTIFICATIONS;
}

export function transformAppState(data: Partial<AppState>) {
  // Copy the pristine content to the error content so we keep our
  // pristine data state but with error status.
  if (data && typeof data === 'object') {
    const appStateKeys = Object.keys(data) as Array<keyof typeof data>;
    for (const key of appStateKeys) {
      if (data[key] && key !== 'controller' && data[key]?.status === 'ERROR') {
        if (data[key]?.content === null) {
          data[key]!.content =
            PRISTINE_APPSTATE[key].content || data[key]!.content;
        }
      }
    }
    if ('NOTIFICATIONS' in data) {
      data['NOTIFICATIONS'] = transformNotifications(data.NOTIFICATIONS!);
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
