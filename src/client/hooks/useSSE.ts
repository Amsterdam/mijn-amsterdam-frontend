import { useCallback, useEffect, useState, useRef } from 'react';

export const SSE_UNLOAD_MESSAGE = 'sse-unload';
export const SSE_UNMOUNT_MESSAGE = 'sse-unmount';
export const SSE_ERROR_MESSAGE = 'sse-error';
export const SSE_CLOSE_MESSAGE = 'sse-close';
export const MAX_CONNECTION_RETRY_COUNT = 3;

interface useSSEProps {
  path: string;
  eventName: string;
  callback: (message: object | string) => void;
  postpone: boolean;
}

export function useSSE({ path, eventName, callback, postpone }: useSSEProps) {
  const [es, setEs] = useState<EventSource | null>(null);
  const connectionCounter = useRef(0);

  const connect = useCallback((path: string) => {
    const es = new globalThis.EventSource(path, { withCredentials: true });
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

  const closeEventSource = useCallback(
    (message: string) => {
      connectionCounter.current = 0;
      es?.close();
      callback(message);
    },
    [es, callback]
  );

  const handleError = useCallback(
    (_error: Event) => {
      // eslint-disable-next-line no-console
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
          closeEventSource(SSE_ERROR_MESSAGE);
          break;
        // We're open but an error occured during communication
        case EventSource.OPEN === es?.readyState &&
          connectionCounter.current <= MAX_CONNECTION_RETRY_COUNT:
          closeEventSource(SSE_ERROR_MESSAGE);
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
    (message: MessageEvent) => {
      if (message.lastEventId === 'close') {
        closeEventSource(SSE_CLOSE_MESSAGE);
        return;
      }

      let messageData = SSE_ERROR_MESSAGE;

      try {
        messageData = JSON.parse(message.data);
      } catch (_error) {
        // eslint-disable-next-line no-console
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
    function closeOnUnload() {
      closeEventSource(SSE_UNLOAD_MESSAGE);
    }
    globalThis.addEventListener('beforeunload', closeOnUnload);

    return () => {
      es.removeEventListener('error', handleError);
      es.removeEventListener('open', handleOpen);
      es.removeEventListener(eventName, onMessageEvent);

      globalThis.removeEventListener('beforeunload', closeOnUnload);

      // Close the EventSource when cleaning up this hook.
      closeEventSource(SSE_UNMOUNT_MESSAGE);
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
