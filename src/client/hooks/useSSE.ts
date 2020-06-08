import * as Sentry from '@sentry/browser';
import { useCallback, useEffect, useState } from 'react';

const RECONNECT_TIMEOUT_MS = 1000;
const MAX_RETRY_COUNT = 10;

let retryCount = 0;

export function useSSE(
  path: string,
  eventName: string,
  callback: (message: any) => void
) {
  const [es, setEventSource] = useState<EventSource | null>(null);

  const connect = useCallback(() => {
    const es = new EventSource(path);
    setEventSource(es);
  }, [path]);

  useEffect(() => {
    connect();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!es) {
      return;
    }
    let unMounted = false;

    const handleError = (error: any) => {
      es.close();

      if (retryCount !== MAX_RETRY_COUNT) {
        setTimeout(() => {
          if (!unMounted) {
            retryCount += 1;
            connect();
          }
        }, RECONNECT_TIMEOUT_MS);
      } else {
        if (error instanceof Error) {
          Sentry.captureMessage(`SSE:ERROR: Retry terminated`);
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(
            `SSE:ERROR: Retry terminated`,
            error.toString()
          );
        }

        callback({
          ALL: {
            status: 'ERROR',
            message:
              'Could not connect to Event Source. Connection retry terminated.',
          },
        });
      }
    };
    const handleOpen = () => {
      retryCount = 0;
    };
    const closeEventSource = () => {
      es.close();
    };
    const onMessageEvent = (message: any) => callback(JSON.parse(message.data));

    es.addEventListener('error', handleError);
    es.addEventListener('open', handleOpen);
    es.addEventListener('close', closeEventSource);
    es.addEventListener(eventName, onMessageEvent);

    return () => {
      unMounted = true;
      es.removeEventListener('error', handleError);
      es.removeEventListener('open', handleOpen);
      es.removeEventListener('close', closeEventSource);
      es.removeEventListener(eventName, onMessageEvent);
    };
  }, [eventName, es, callback, connect]);
}
