import axios from 'axios';
import { renderHook, act } from 'react-hooks-testing-library';
import { useDataApi, getDefaultState } from './api.hook';
import MockAdapter from 'axios-mock-adapter';

const DUMMY_RESPONSE = { foo: 'bar' };
const DUMMY_URL = 'http://test';

describe('Api hook', () => {
  const axMock = new MockAdapter(axios);

  axMock.onGet('http://test').reply(200, DUMMY_RESPONSE);

  it('should have a default state', () => {
    const { result } = renderHook(() => useDataApi());
    expect(result.current[0]).toEqual(getDefaultState());
  });

  it('should postpone immediate fetching', () => {
    const { result } = renderHook(() =>
      useDataApi({
        url: '',
        postpone: true,
      })
    );
    const state = { ...getDefaultState(), isLoading: false };
    expect(result.current[0]).toEqual(state);
  });

  it('should make http request and update api state', async () => {
    const options = {
      url: DUMMY_URL,
      postpone: true,
    };
    const { result, waitForNextUpdate } = renderHook(() => useDataApi(options));

    // make fetch call
    act(() => {
      result.current[1](options);
    });

    expect(result.current[0].isLoading).toBe(true);
    expect(result.current[0].isDirty).toBe(false);
    expect(result.current[0].isPristine).toBe(true);
    expect(result.current[0].isError).toBe(false);

    await waitForNextUpdate();

    expect(result.current[0].isLoading).toBe(false);
    expect(result.current[0].isDirty).toBe(true);
    expect(result.current[0].isPristine).toBe(false);
    expect(result.current[0].isError).toBe(false);

    expect(result.current[0].data).toEqual(DUMMY_RESPONSE);
  });
});
