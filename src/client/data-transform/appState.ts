import { AppState } from '../AppState';
import { WelcomeNotification } from '../config/staticData';

function transformNotifications(NOTIFICATIONS: AppState['NOTIFICATIONS']) {
  if (NOTIFICATIONS.status === 'OK') {
    NOTIFICATIONS.content.items.push(WelcomeNotification);
  }
  return NOTIFICATIONS;
}

export function transformAppState(data: Partial<AppState>) {
  if ('NOTIFICATIONS' in data) {
    data['NOTIFICATIONS'] = transformNotifications(data.NOTIFICATIONS!);
  }

  return data;
}
