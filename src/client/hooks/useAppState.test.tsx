import * as Sentry from '@sentry/react';
import axios from 'axios';
import { apiPristineResult, apiSuccessResult } from '../../universal/helpers';
import * as appStateModule from '../AppState';
import { renderRecoilHook } from '../utils/renderRecoilHook';
import { newEventSourceMock } from './EventSourceMock';
import * as dataApiHook from './api/useDataApi';
import { isAppStateReady, useAppStateRemote } from './useAppState';
import * as sseHook from './useSSE';
import { SSE_ERROR_MESSAGE } from './useSSE';

import {
  SpyInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { act, waitFor } from '@testing-library/react';

vi.mock('./api/useTipsApi');
vi.mock('./useOptIn');
vi.mock('./useProfileType');

describe('useAppState', () => {
  const stateSliceMock = { BRP: { content: { hello: 'world' } } };

  const initialAppState = appStateModule.PRISTINE_APPSTATE;

  let dataApiSpy: SpyInstance;
  let axiosGetSpy: SpyInstance;
  let sseSpy: SpyInstance;

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

    const { result, rerender } = renderRecoilHook(() => useAppStateRemote());

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
    const { result, rerender } = renderRecoilHook(() => useAppStateRemote());

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
    const { result, rerender } = renderRecoilHook(() => useAppStateRemote());

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

  describe('isAppStateReady', () => {
    const pristineState = {
      TEST: apiPristineResult(null, { profileTypes: ['private'] }),
    } as any;

    it('Should initially be false', async () => {
      const appState = { TEST: pristineState.TEST } as any;

      const isReady = isAppStateReady(appState, pristineState, 'private');
      expect(isReady).toBe(false);
    });

    it('Should be true if we have proper data', async () => {
      const isReady = isAppStateReady(
        { TEST: apiSuccessResult('test') } as any,
        pristineState,
        'private'
      );
      expect(isReady).toBe(true);
    });

    it('Should be false if we have proper data but a different profile type', async () => {
      const isReady = isAppStateReady(
        { TEST: apiSuccessResult('test') } as any,
        pristineState,
        'commercial'
      );
      expect(isReady).toBe(false);
    });

    it('Should be false if we have statekey mismatch', async () => {
      const spy = vi.spyOn(Sentry, 'captureMessage');
      const isReady = isAppStateReady(
        { BLAP: apiSuccessResult('blap') } as any,
        pristineState,
        'private'
      );
      expect(isReady).toBe(true);
      expect(spy).toHaveBeenCalledWith('unknown stateConfig key: BLAP');
    });
  });
});
