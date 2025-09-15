import { act, renderHook, waitFor } from '@testing-library/react';
import {
  MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import * as dataApiHook from './api/useDataApi-v2';
import { useAppStateRemote, useAppStateStore } from './useAppState';
import { newEventSourceMock } from '../../testing/EventSourceMock';
import * as appStateModule from '../AppState';
import * as sseHook from './useSSE';
import { SSE_ERROR_MESSAGE } from './useSSE';

vi.mock('./api/useTipsApi');
vi.mock('./useProfileType');

const fetch = vi.fn();
global.fetch = fetch;

function createFetchResponse(content: any, ok: boolean = true) {
  return {
    json: () => new Promise((resolve) => resolve(content)),
    ok,
  };
}

const initialAppState = appStateModule.PRISTINE_APPSTATE;

describe('useAppState', () => {
  let useBffApiSpy: MockInstance;
  let sseSpy: MockInstance;

  beforeEach(() => {
    useAppStateStore.setState(structuredClone(initialAppState));
    useBffApiSpy = vi.spyOn(dataApiHook, 'useBffApi');
    sseSpy = vi.spyOn(sseHook, 'useSSE');
  });

  afterEach(() => {
    fetch.mockClear();
    useBffApiSpy.mockRestore();
    sseSpy.mockRestore();
  });

  it('Should start with the SSE endpoint', async () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());
    const stateSliceMock = { BRP: { content: { hello: 'world' } } };
    const { result } = renderHook(() => useAppStateRemote());

    expect(result.current).toEqual(initialAppState);

    act(() => {
      EventSourceMock.prototype.evHandlers.message({
        data: JSON.stringify(stateSliceMock),
      });
    });

    expect(useBffApiSpy).toBeCalledTimes(4);
    expect(fetch).toBeCalledTimes(0);

    expect(result.current).toStrictEqual({
      ...initialAppState,
      ...stateSliceMock,
    });
  });

  it('Should start with the Fallback service endpoint for browsers that do not have window.EventSource', async () => {
    delete (window as any).EventSource;

    const stateSliceMock = { BRP: { content: { bar: 'world' } } };
    fetch.mockResolvedValueOnce(createFetchResponse(stateSliceMock));

    const { result } = renderHook(() => useAppStateRemote());

    expect(fetch).toBeCalledTimes(1);

    await waitFor(() => {
      return expect(result.current).toEqual({
        ...initialAppState,
        ...stateSliceMock,
      });
    });
  });

  it('Should use Fallback service endpoint if EventSource fails to connect', async () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());

    const stateSliceMock = { BRP: { content: { foo: 'bar' } } };
    fetch.mockResolvedValueOnce(createFetchResponse(stateSliceMock));

    const { result } = renderHook(() => useAppStateRemote());

    act(() => {
      EventSourceMock.prototype.evHandlers.message({
        data: JSON.stringify(SSE_ERROR_MESSAGE),
      }); // Hack to trigger the error callback
    });

    await waitFor(() => expect(fetch).toBeCalledTimes(1));
    await waitFor(() => {
      expect(result.current).toEqual({ ...initialAppState, ...stateSliceMock });
    });
  });

  // it('Should respond with an appState error entry if Fallback service and SSE both fail.', async () => {
  //   const EventSourceMock = ((window as any).EventSource =
  //     newEventSourceMock());
  //   const { result } = renderHook(() => useAppStateRemote());

  //   fetch.mockRejectedValueOnce(new Error('bad stuff'));

  //   expect(result.current).toEqual(initialAppState);

  //   act(() => {
  //     EventSourceMock.prototype.evHandlers.message({
  //       data: JSON.stringify(SSE_ERROR_MESSAGE),
  //     }); // Hack to trigger the error callback
  //   });

  //   expect(sseSpy).toBeCalledTimes(5);
  //   expect(bffApiSpy).toBeCalledTimes(5);
  //   expect(fetch).toBeCalledTimes(1);

  //   await waitFor(() => {
  //     expect(result.current).toEqual(
  //       Object.assign({}, initialAppState, {
  //         ALL: {
  //           status: 'ERROR',
  //           message:
  //             'Services.all endpoint could not be reached or returns an error.',
  //         },
  //       })
  //     );
  //   });
  // });

  // test('addParamsToStreamEndpoint', () => {
  //   const origValue = FeatureToggle.passQueryParamsToStreamUrl;

  //   // @ts-expect-error :: For testing purposes
  //   FeatureToggle.passQueryParamsToStreamUrl = false;

  //   expect(addParamsToStreamEndpoint('/foo/bar')).toBe('/foo/bar');

  //   expect(
  //     addParamsToStreamEndpoint(
  //       '/foo/bar',
  //       '?tipsCompareDate=2021-05-23&fooBar=blap'
  //     )
  //   ).toBe('/foo/bar');

  //   // @ts-expect-error :: For testing purposes
  //   FeatureToggle.passQueryParamsToStreamUrl = true;

  //   expect(
  //     addParamsToStreamEndpoint(
  //       '/foo/bar',
  //       '?tipsCompareDate=2021-05-23&fooBar=blap'
  //     )
  //   ).toBe('/foo/bar?tipsCompareDate=2021-05-23');

  //   // @ts-expect-error :: For testing purposes
  //   FeatureToggle.passQueryParamsToStreamUrl = origValue;
  // });
});
