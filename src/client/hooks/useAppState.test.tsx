import { act, waitFor } from '@testing-library/react';
import axios from 'axios';
import {
  MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import * as dataApiHook from './api/useDataApi.ts';
import { addParamsToStreamEndpoint, useAppStateRemote } from './useAppState.ts';
import * as sseHook from './useSSE.ts';
import { SSE_ERROR_MESSAGE } from './useSSE.ts';
import { newEventSourceMock } from '../../testing/EventSourceMock.ts';
import { renderRecoilHook } from '../../testing/render-recoil.hook.tsx';
import { FeatureToggle } from '../../universal/config/feature-toggles.ts';
import * as appStateModule from '../AppState.ts';

vi.mock('./api/useTipsApi');
vi.mock('./useProfileType');

describe('useAppState', () => {
  const stateSliceMock = { BRP: { content: { hello: 'world' } } };

  const initialAppState = appStateModule.PRISTINE_APPSTATE;

  let dataApiSpy: MockInstance;
  let axiosGetSpy: MockInstance;
  let sseSpy: MockInstance;

  beforeEach(() => {
    dataApiSpy = vi.spyOn(dataApiHook, 'useDataApi');
    axiosGetSpy = vi.spyOn(axios, 'get');
    sseSpy = vi.spyOn(sseHook, 'useSSE');
  });

  afterEach(() => {
    dataApiSpy.mockRestore();
    axiosGetSpy.mockRestore();
    sseSpy.mockRestore();
  });

  it('Should start with the SSE endpoint', async () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());

    const { result } = renderRecoilHook(() => useAppStateRemote());

    expect(result.current).toEqual(initialAppState);

    act(() => {
      EventSourceMock.prototype.evHandlers.message({
        data: JSON.stringify(stateSliceMock),
      });
    });

    expect(dataApiSpy).toBeCalledTimes(3);
    expect(axiosGetSpy).toBeCalledTimes(0);

    expect(result.current).toStrictEqual(
      Object.assign({}, initialAppState, stateSliceMock)
    );
  });

  it('Should start with the Fallback service endpoint for browsers that do not have window.EventSource', async () => {
    delete (window as any).EventSource;

    axiosGetSpy.mockResolvedValueOnce({ data: stateSliceMock });

    const { result } = renderRecoilHook(() => useAppStateRemote());

    expect(result.current).toEqual(initialAppState);

    expect(dataApiSpy).toBeCalledTimes(3);
    expect(sseSpy).toBeCalledTimes(3);
    expect(axiosGetSpy).toBeCalledTimes(1);

    await waitFor(() => {
      expect(result.current).toEqual(
        Object.assign({}, initialAppState, stateSliceMock)
      );
    });
  });

  it('Should use Fallback service endpoint if EventSource fails to connect', async () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());
    const { result } = renderRecoilHook(() => useAppStateRemote());

    axiosGetSpy.mockResolvedValueOnce({ data: stateSliceMock });

    expect(result.current).toEqual(initialAppState);

    act(() => {
      EventSourceMock.prototype.evHandlers.message({
        data: JSON.stringify(SSE_ERROR_MESSAGE),
      }); // Hack to trigger the error callback
    });

    expect(sseSpy).toBeCalledTimes(5);
    expect(dataApiSpy).toBeCalledTimes(5);
    expect(axiosGetSpy).toBeCalledTimes(1);

    await waitFor(() => {
      expect(result.current).toEqual(
        Object.assign({}, initialAppState, stateSliceMock)
      );
    });
  });

  it('Should respond with an appState error entry if Fallback service and SSE both fail.', async () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());
    const { result } = renderRecoilHook(() => useAppStateRemote());

    axiosGetSpy.mockRejectedValueOnce(new Error('bad stuff'));

    expect(result.current).toEqual(initialAppState);

    act(() => {
      EventSourceMock.prototype.evHandlers.message({
        data: JSON.stringify(SSE_ERROR_MESSAGE),
      }); // Hack to trigger the error callback
    });

    expect(sseSpy).toBeCalledTimes(5);
    expect(dataApiSpy).toBeCalledTimes(5);
    expect(axiosGetSpy).toBeCalledTimes(1);

    await waitFor(() => {
      expect(result.current).toEqual(
        Object.assign({}, initialAppState, {
          ALL: {
            status: 'ERROR',
            message:
              'Services.all endpoint could not be reached or returns an error.',
          },
        })
      );
    });
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
