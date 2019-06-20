import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import usePaginatedApi from 'hooks/api/paginated-api.hook';
import { renderHook } from 'react-hooks-testing-library';

const DUMMY_RESPONSE = {
  items: ['a', 'b'],
  total: 10,
  offset: 0,
  limit: 25,
};
const DUMMY_URL = 'http://test';

describe('Paginated api hook', () => {
  const axMock = new MockAdapter(axios);
  axMock.onGet(DUMMY_URL).reply(200, DUMMY_RESPONSE);

  it('should respond with the correct data', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePaginatedApi(DUMMY_URL)
    );
    await waitForNextUpdate();
    expect(result.current.data).toEqual(DUMMY_RESPONSE);
  });
});
