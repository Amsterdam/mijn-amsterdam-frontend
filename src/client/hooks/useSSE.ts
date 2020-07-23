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

  // Connecting to the EventSource.
  useEffect(() => {
    if (!es && !postpone && connectionCounter !== MAX_RETRY_COUNT) {
      connect();
    }
  }, [es, connect, postpone]);

  // TODO: Uncomment this effect if we need explicit data stream for dynamic profile switch
  // useEffect(() => {
  //   if (es) {
  //     setEventSource(null);
  //   }
  //   // WE don't have to know which ES is present, just if one is. On Path change we need a new EventSource whatsoever.
  //   // Resetting the eventSource will trigger the Connecting to the EventSource effect. This is why we can leave it out of
  //   // the dependency array.
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [path]);

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
      // After an explicit close event we can safely reset the connection counter.
      connectionCounter = 0;
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
