import { act, renderHook } from '@testing-library/react';
import { describe, expect, vi, it } from 'vitest';

import * as sseHook from './useSSE';
import { MAX_CONNECTION_RETRY_COUNT, SSE_ERROR_MESSAGE } from './useSSE';
import { newEventSourceMock } from '../../testing/EventSourceMock';

const sseMockResponse = JSON.stringify({
  FOO: { content: { hello: 'world' } },
});

describe('useAppState', () => {
  vi.spyOn(console, 'log').mockImplementation(() => void 0);
  vi.spyOn(console, 'info').mockImplementation(() => void 0);
  vi.spyOn(console, 'error').mockImplementation(() => void 0);

  it('Should connect and respond with multiple messages.', async () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());
    const onEventCallback = vi.fn();
    const hook = renderHook(() =>
      sseHook.useSSE({
        path: 'http://mock-sse',
        eventName: 'message',
        callback: onEventCallback,
        postpone: false,
      })
    );

    expect(EventSourceMock.prototype.init).toHaveBeenCalled();
    expect(EventSourceMock.prototype.addEventListener).toHaveBeenCalledTimes(3);

    act(() => {
      EventSourceMock.prototype.evHandlers.message({ data: sseMockResponse });
    });

    expect(onEventCallback).toHaveBeenCalledWith(JSON.parse(sseMockResponse));

    hook.unmount();

    expect(EventSourceMock.prototype.removeEventListener).toHaveBeenCalledTimes(
      3
    );
  });

  it('Should connect fail, retry and respond with an error.', async () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());
    const onEventCallback = vi.fn();
    renderHook(() =>
      sseHook.useSSE({
        path: 'http://mock-sse',
        eventName: 'message',
        callback: onEventCallback,
        postpone: false,
      })
    );

    expect(EventSourceMock.prototype.init).toHaveBeenCalledTimes(1);
    expect(EventSourceMock.prototype.addEventListener).toHaveBeenCalledTimes(3);

    // Simulate retries
    for (let i = 0; i < MAX_CONNECTION_RETRY_COUNT; i += 1) {
      EventSourceMock.prototype.open();
      expect(EventSourceMock.prototype.evHandlers.open).toHaveBeenCalledTimes(
        i + 1
      );

      EventSourceMock.prototype.error(new Error('Server not reachable.'));
      expect(EventSourceMock.prototype.evHandlers.error).toHaveBeenCalledTimes(
        i + 1
      );
    }

    expect(EventSourceMock.prototype.close).toHaveBeenCalledTimes(1);
    expect(onEventCallback).toHaveBeenCalledWith(SSE_ERROR_MESSAGE);
  });

  it('Should not connect if postponed.', () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());
    const onEventCallback = vi.fn();
    renderHook(() =>
      sseHook.useSSE({
        path: 'http://mock-sse',
        eventName: 'message',
        callback: onEventCallback,
        postpone: true,
      })
    );

    // First try
    expect(EventSourceMock.prototype.init).toHaveBeenCalledTimes(0);
    expect(EventSourceMock.prototype.addEventListener).toHaveBeenCalledTimes(0);
  });

  it('Should fail immediately if connection is closed but with error.', () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());
    const onEventCallback = vi.fn();
    EventSourceMock.prototype.readyState = 2;

    renderHook(() =>
      sseHook.useSSE({
        path: 'http://mock-sse',
        eventName: 'message',
        callback: onEventCallback,
        postpone: false,
      })
    );

    EventSourceMock.prototype.error(new Error('Server not reachable.'));

    expect(onEventCallback).toHaveBeenCalledWith(SSE_ERROR_MESSAGE);
  });

  it('Should fail immediately if connection is open but with error.', () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());
    const onEventCallback = vi.fn();
    EventSourceMock.prototype.readyState = 1;

    renderHook(() =>
      sseHook.useSSE({
        path: 'http://mock-sse',
        eventName: 'message',
        callback: onEventCallback,
        postpone: false,
      })
    );

    EventSourceMock.prototype.error(new Error('Server not reachable.'));
    expect(onEventCallback).toHaveBeenCalledWith(SSE_ERROR_MESSAGE);
  });
});
