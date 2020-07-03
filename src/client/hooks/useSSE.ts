import { useCallback, useEffect, useState } from 'react';

let connectionCounter = 0;
const WAIT_MS_BEFORE_RETRY = 2000;
export const MAX_RETRY_COUNT = 4;
export const SSE_ERROR_MESSAGE = 'sse-error';

export function useSSE(
  path: string,
  eventName: string,
  callback: (message: any) => void,
  postpone: boolean
) {
  const [es, setEventSource] = useState<EventSource | null>(null);

  const connect = useCallback(() => {
    const es = new EventSource(path);
    connectionCounter += 1;
    console.info('[SSE] Connect ', connectionCounter);
    setEventSource(es);
  }, [path]);

  useEffect(() => {
    if (!es && !postpone && connectionCounter !== MAX_RETRY_COUNT) {
      connect();
    }
  }, [es, connect, postpone]);

  useEffect(() => {
    if (!es || postpone) {
      return;
    }

    const handleError = (error: any) => {
      console.info('[SSE] Error connecting');

      es.close();

      setTimeout(() => {
        if (connectionCounter !== MAX_RETRY_COUNT) {
          connect();
        }
      }, WAIT_MS_BEFORE_RETRY);

      if (connectionCounter === MAX_RETRY_COUNT) {
        console.error(
          `[SSE] can't establish connection after ${connectionCounter} tries.`
        );
        callback(SSE_ERROR_MESSAGE);
      }
    };
    const handleOpen = () => {
      console.info('[SSE] Open connection');
    };
    const closeEventSource = () => {
      console.info('[SSE] Close connection');
      es.close();
    };
    const onMessageEvent = (message: any) => {
      try {
        callback(JSON.parse(message.data));
      } catch (error) {
        console.error('[SSE] Parsing sse message data failed.');
        callback(SSE_ERROR_MESSAGE);
      }
    };

    es.addEventListener('error', handleError);
    es.addEventListener('open', handleOpen);
    es.addEventListener('close', closeEventSource);
    es.addEventListener(eventName, onMessageEvent);

    return () => {
      console.info('[SSE] Unmounting hook');
      if (
        es.readyState === EventSource.OPEN ||
        es.readyState === EventSource.CONNECTING
      ) {
        es.close();
      }
      es.removeEventListener('error', handleError);
      es.removeEventListener('open', handleOpen);
      es.removeEventListener('close', closeEventSource);
      es.removeEventListener(eventName, onMessageEvent);
    };
  }, [eventName, es, callback, connect, postpone]);
}
