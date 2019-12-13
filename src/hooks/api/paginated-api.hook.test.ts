import { renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import usePaginatedApi from 'hooks/api/paginated-api.hook';

const DUMMY_RESPONSE_1 = {
  items: ['a', 'b'],
  total: 10,
  offset: 0,
  limit: 25,
};

const DUMMY_RESPONSE_2 = {
  bliep: 'blap',
};
const DUMMY_RESPONSE_3 = null;
const DUMMY_RESPONSE_4 = '';

const DUMMY_URL_1 = 'http://test_1';
const DUMMY_URL_2 = 'http://test_2';
const DUMMY_URL_3 = 'http://test_3';
const DUMMY_URL_4 = 'http://test_4';
const DUMMY_URL_5 = 'http://test_bad';

const FORMATTED_DUMMY_RESPONSE = { items: [], limit: -1, total: 0 };

describe('Paginated api hook', () => {
  const axMock = new MockAdapter(axios);
  axMock.onGet(DUMMY_URL_1).reply(200, DUMMY_RESPONSE_1);
  axMock.onGet(DUMMY_URL_2).reply(200, DUMMY_RESPONSE_2);
  axMock.onGet(DUMMY_URL_3).reply(200, DUMMY_RESPONSE_3);
  axMock.onGet(DUMMY_URL_4).reply(200, DUMMY_RESPONSE_4);
  axMock.onGet(DUMMY_URL_5).reply(500);

  it('should respond with the correct data and state', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginatedApi({ url: DUMMY_URL_1 })
    );
    expect(result.current.isLoading).toEqual(true);
    expect(result.current.isPristine).toEqual(true);
    expect(result.current.isDirty).toEqual(false);

    await waitForNextUpdate();

    expect(result.current.data).toEqual(DUMMY_RESPONSE_1);
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.isDirty).toEqual(true);
    expect(result.current.isPristine).toEqual(false);
  });

  it('should respond with the default data after unexpected response', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginatedApi({ url: DUMMY_URL_2 })
    );
    await waitForNextUpdate();
    expect(result.current.data).toEqual(FORMATTED_DUMMY_RESPONSE);
  });

  it('should respond with the default data after unexpected response', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginatedApi({ url: DUMMY_URL_3 })
    );
    await waitForNextUpdate();
    expect(result.current.data).toEqual(FORMATTED_DUMMY_RESPONSE);
  });

  it('should respond with the default data after unexpected response', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginatedApi({ url: DUMMY_URL_4 })
    );
    await waitForNextUpdate();
    expect(result.current.data).toEqual(FORMATTED_DUMMY_RESPONSE);
  });

  it('should respond with error state', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginatedApi({ url: DUMMY_URL_5 })
    );
    await waitForNextUpdate();
    expect(result.current.isError).toEqual(true);
  });
});
