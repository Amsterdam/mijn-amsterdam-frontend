import { AppState } from '../AppState';
import { WelcomeNotification } from '../config/staticData';
import { PRISTINE_APPSTATE } from '../hooks/useAppState';

function transformNotifications(NOTIFICATIONS: AppState['NOTIFICATIONS']) {
  if (NOTIFICATIONS.status === 'OK') {
    NOTIFICATIONS.content.items.push(WelcomeNotification);
  }
  return NOTIFICATIONS;
}

export function transformAppState(data: Partial<AppState>) {
  // Copy the pristine content to the error content so we keep our
  // pristine data state but with error status.
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
