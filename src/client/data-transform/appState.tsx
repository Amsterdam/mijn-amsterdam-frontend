import * as Sentry from '@sentry/browser';
import { AppState, createAllErrorState, PRISTINE_APPSTATE } from '../AppState';

export function transformSourceData(data: Partial<AppState> | null) {
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

    return data;
  }

  Sentry.captureMessage(
    '[transformSourceData] Data returned from server is not an object',
    {
      extra: {
        data,
      },
    }
  );

  return createAllErrorState(PRISTINE_APPSTATE, 'Received invalid appState');
}
