import { AppState, createAllErrorState, PRISTINE_APPSTATE } from '../AppState';
import { captureMessage } from '../utils/monitoring';

export function transformSourceData(data: Partial<AppState> | null) {
  // Copy the pristine content to the error content so we keep our
  // pristine data state but with error status.
  const unexpectedStateKeys = [];
  if (data !== null && typeof data === 'object') {
    const appStateKeys = Object.keys(data) as Array<keyof typeof data>;
    for (const key of appStateKeys) {
      if (!PRISTINE_APPSTATE[key]) {
        unexpectedStateKeys.push(key);
        delete data[key];
        continue;
      }
      if (
        typeof data[key] !== 'object' ||
        data[key] === null ||
        data[key]?.status === 'ERROR'
      ) {
        if (typeof data[key] !== 'object' || data[key] === null) {
          // @ts-ignore
          data[key] = PRISTINE_APPSTATE[key];
        } else {
          data[key]!.content = PRISTINE_APPSTATE[key]?.content || null;
        }
      }
    }

    if (unexpectedStateKeys.length) {
      captureMessage('[transformSourceData] Unknown stateKey encountered', {
        properties: {
          unexpectedStateKeys,
        },
      });
    }

    return data;
  }

  captureMessage(
    '[transformSourceData] Data returned from server is not an object',
    {
      properties: {
        data,
        identity: document.cookie,
      },
    }
  );

  return createAllErrorState(PRISTINE_APPSTATE, 'Received invalid appState');
}
