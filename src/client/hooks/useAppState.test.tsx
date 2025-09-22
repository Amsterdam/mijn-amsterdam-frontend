import { act, renderHook, waitFor } from '@testing-library/react';
import {
  MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  vi,
} from 'vitest';

import {
  addParamsToStreamEndpoint,
  useAppStateRemote,
} from './useAppStateRemote';
import { useAppStateStore } from './useAppStateStore';
import * as sseHook from './useSSE';
import { SSE_ERROR_MESSAGE } from './useSSE';
import { newEventSourceMock } from '../../testing/EventSourceMock';
import { FeatureToggle } from '../../universal/config/feature-toggles';

vi.mock('./api/useTipsApi');
vi.mock('./useProfileType');

function createFetchResponse(content: any, ok: boolean = true) {
  return {
    json: () => new Promise((resolve) => resolve(content)),
    ok,
    url: 'http://example.com/request',
    status: ok ? 200 : 500,
  };
}

const originalFetch = global.fetch;

let fetchMock: MockInstance;

describe('useAppState', () => {
  let sseSpy: MockInstance;

  beforeEach(() => {
    fetchMock = global.fetch = vi.fn();
    sseSpy = vi.spyOn(sseHook, 'useSSE');
  });

  afterEach(() => {
    sseSpy.mockRestore();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test('Should start with the SSE endpoint', async () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());
    const stateSliceMock = { BRP: { content: { hello: 'world' } } };
    renderHook(() => useAppStateRemote());

    act(() => {
      EventSourceMock.prototype.evHandlers.message({
        data: JSON.stringify(stateSliceMock),
      });
    });

    await waitFor(() => {
      expect(fetchMock).toBeCalledTimes(0);
    });

    const state = useAppStateStore.getState();
    expect(state.BRP).toEqual(stateSliceMock.BRP);
  });

  test('Should start with the Fallback service endpoint for browsers that do not have window.EventSource', async () => {
    delete (window as any).EventSource;

    const stateSliceMock = { BRP: { content: { bar: 'world' } } };
    fetchMock.mockResolvedValueOnce(createFetchResponse(stateSliceMock));

    renderHook(() => useAppStateRemote());

    await waitFor(() => {
      expect(fetchMock).toBeCalledTimes(1);
    });

    expect(useAppStateStore.getState().BRP).toEqual(stateSliceMock.BRP);
  });

  test('Should use Fallback service endpoint if EventSource fails to connect', async () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());

    const stateSliceMock = { BRP: { content: { foo: 'blappie' } } };
    fetchMock.mockResolvedValueOnce(createFetchResponse(stateSliceMock));

    renderHook(() => useAppStateRemote());

    act(() => {
      EventSourceMock.prototype.evHandlers.message({
        data: JSON.stringify(SSE_ERROR_MESSAGE),
      }); // Hack to trigger the error callback
    });

    // This tests the fallback fetch call
    await waitFor(() => {
      expect(fetchMock).toBeCalledTimes(1);
    });

    expect(useAppStateStore.getState().BRP).toEqual(stateSliceMock.BRP);
  });

  test('Should respond with an appState error entry if Fallback service and SSE both fail.', async () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());
    fetchMock.mockResolvedValue(createFetchResponse(null, false));
    renderHook(() => useAppStateRemote());

    act(() => {
      EventSourceMock.prototype.evHandlers.message({
        data: JSON.stringify(SSE_ERROR_MESSAGE),
      }); // Hack to trigger the error callback
    });

    await waitFor(() => {
      expect(fetchMock).toBeCalledTimes(1);
    });

    expect('ALL' in useAppStateStore.getState()).toBe(true);
  });

  test('addParamsToStreamEndpoint', () => {
    const origValue = FeatureToggle.passQueryParamsToStreamUrl;

    // @ts-expect-error :: For testing purposes
    FeatureToggle.passQueryParamsToStreamUrl = false;

    expect(addParamsToStreamEndpoint('/foo/bar')).toBe('/foo/bar');

    expect(
      addParamsToStreamEndpoint(
        '/foo/bar',
        '?tipsCompareDate=2021-05-23&fooBar=blap'
      )
    ).toBe('/foo/bar');

    // @ts-expect-error :: For testing purposes
    FeatureToggle.passQueryParamsToStreamUrl = true;

    expect(
      addParamsToStreamEndpoint(
        '/foo/bar',
        '?tipsCompareDate=2021-05-23&fooBar=blap'
      )
    ).toBe('/foo/bar?tipsCompareDate=2021-05-23');

    // @ts-expect-error :: For testing purposes
    FeatureToggle.passQueryParamsToStreamUrl = origValue;
  });
});
