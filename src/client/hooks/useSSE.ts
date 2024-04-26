import { useCallback, useEffect, useState, useRef } from 'react';

export const SSE_ERROR_MESSAGE = 'sse-error';
export const MAX_CONNECTION_RETRY_COUNT = 3;

interface useSSEProps {
  path: string;
  eventName: string;
  callback: (message: any) => void;
  postpone: boolean;
}

export function useSSE({ path, eventName, callback, postpone }: useSSEProps) {
  const [es, setEs] = useState<EventSource | null>(null);
  const connectionCounter = useRef(0);

  const connect = useCallback((path: string) => {
    const es = new window.EventSource(path, { withCredentials: true });
    setEs(es);
  }, []);

  useEffect(() => {
    if (!postpone) {
      connect(path);
    }
  }, [path, connect, postpone]);

  const handleOpen = useCallback(() => {
    connectionCounter.current += 1;
  }, []);

  const closeEventSource = useCallback(() => {
    connectionCounter.current = 0;
    es?.close();
  }, [es]);

  const handleError = useCallback(
    (error: any) => {
      console.info(
        '[SSE] Error connecting, ES ReadyState:',
        es?.readyState,
        'count: ',
        connectionCounter.current
      );
      switch (true) {
        // Trying to connect but responding with an error
        case EventSource.CONNECTING === es?.readyState &&
          connectionCounter.current >= MAX_CONNECTION_RETRY_COUNT:
          closeEventSource();
          callback(SSE_ERROR_MESSAGE);
          break;
        // We're open but an error occured during communication
        case EventSource.OPEN === es?.readyState &&
          connectionCounter.current <= MAX_CONNECTION_RETRY_COUNT:
          closeEventSource();
          callback(SSE_ERROR_MESSAGE);
          break;
        // Closed before reaching max retry means connection not possible
        case EventSource.CLOSED === es?.readyState &&
          connectionCounter.current <= MAX_CONNECTION_RETRY_COUNT:
          callback(SSE_ERROR_MESSAGE);
          break;
      }
    },
    [es, callback, closeEventSource]
  );

  const onMessageEvent = useCallback(
    (message: any) => {
      if (message.lastEventId === 'close') {
        closeEventSource();
        return;
      }

      let messageData = SSE_ERROR_MESSAGE;

      try {
        messageData = JSON.parse(message.data);
      } catch (error) {
        console.error('[SSE] Parsing sse message data failed.');
      }

      callback(messageData);
    },
    [callback, closeEventSource]
  );

  useEffect(() => {
    if (!es) {
      return;
    }

    es.addEventListener('error', handleError);
    es.addEventListener('open', handleOpen);
    es.addEventListener(eventName, onMessageEvent);

    // This listener is here because Monitoring reports back errors of interrupted connections whilst the page is being refreshed.
    // If we close the event source before the unload Monitoring stays calm.
    window.addEventListener('beforeunload', closeEventSource);

    return () => {
      es.removeEventListener('error', handleError);
      es.removeEventListener('open', handleOpen);
      es.removeEventListener(eventName, onMessageEvent);

      window.removeEventListener('beforeunload', closeEventSource);

      // Close the EventSource when cleaning up this hook.
      closeEventSource();
    };
  }, [
    es,
    handleOpen,
    closeEventSource,
    onMessageEvent,
    handleError,
    eventName,
  ]);
}
