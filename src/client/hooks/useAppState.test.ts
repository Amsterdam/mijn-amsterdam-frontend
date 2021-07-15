import { act } from '@testing-library/react-hooks';
import axios from 'axios';
import { renderRecoilHook } from 'react-recoil-hooks-testing-library';
import { PRISTINE_APPSTATE } from '../AppState';
import * as dataApiHook from './api/useDataApi';
import { newEventSourceMock } from './EventSourceMock';
import { useAppStateRemote } from './useAppState';
import * as sseHook from './useSSE';
import { SSE_ERROR_MESSAGE } from './useSSE';

jest.mock('./api/useTipsApi');
jest.mock('./useOptIn');
jest.mock('./useProfileType');

jest.spyOn(console, 'info').mockImplementation();

describe('useAppState', () => {
  const stateSliceMock = { FOO: { content: { hello: 'world' } } };
  const initialAppState = PRISTINE_APPSTATE;

  let dataApiSpy: jest.SpyInstance;
  let axiosGetSpy: jest.SpyInstance;
  let sseSpy: jest.SpyInstance;

  beforeEach(() => {
    dataApiSpy = jest.spyOn(dataApiHook, 'useDataApi');
    axiosGetSpy = jest.spyOn(axios, 'get');
    sseSpy = jest.spyOn(sseHook, 'useSSE');
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

    expect(result.current).toEqual(
      Object.assign({}, initialAppState, stateSliceMock)
    );
  });

  it('Should start with the Fallback service endpoint for browsers that do not have window.EventSource', async () => {
    delete (window as any).EventSource;

    axiosGetSpy.mockResolvedValueOnce({ data: stateSliceMock });

    const { result, waitForNextUpdate } = renderRecoilHook(() =>
      useAppStateRemote()
    );

    expect(result.current).toEqual(initialAppState);

    expect(dataApiSpy).toBeCalledTimes(3);
    expect(sseSpy).toBeCalledTimes(3);
    expect(axiosGetSpy).toBeCalledTimes(1);

    await waitForNextUpdate();

    expect(result.current).toEqual(
      Object.assign({}, initialAppState, stateSliceMock)
    );
  });

  it('Should use Fallback service endpoint if EventSource fails to connect', async () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());
    const { result, waitForNextUpdate } = renderRecoilHook(() =>
      useAppStateRemote()
    );

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

    await waitForNextUpdate();

    expect(result.current).toEqual(
      Object.assign({}, initialAppState, stateSliceMock)
    );
  });

  it('Should respond with an appState error entry if Fallback service and SSE both fail.', async () => {
    const EventSourceMock = ((window as any).EventSource =
      newEventSourceMock());
    const { result, waitForNextUpdate } = renderRecoilHook(() =>
      useAppStateRemote()
    );

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

    await waitForNextUpdate();

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
