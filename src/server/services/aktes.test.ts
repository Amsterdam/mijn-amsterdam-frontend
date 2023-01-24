import MockAdapter from 'axios-mock-adapter';
import { jsonCopy } from '../../universal/helpers';
import { ApiUrls } from '../config';
import { axiosRequest } from '../helpers';
import aktesSourceData from '../mock-data/json/aktes.json';
import { AKTESDataFromSource, fetchAKTES, transformAKTESData } from './aktes';

describe('Aktes service', () => {
  const axMock = new MockAdapter(axiosRequest);
  const DUMMY_RESPONSE = jsonCopy(aktesSourceData);

  afterAll(() => {
    axMock.restore();
  });

  it('Should fetch the data', async () => {
    axMock.onGet(String(ApiUrls.AKTES)).replyOnce(200, DUMMY_RESPONSE);

    const rs = await fetchAKTES('x', {
      profile: { authMethod: 'digid', profileType: 'private', id: 'bsnxxx' },
      token: 'xxxx',
    });

    expect(rs).toStrictEqual({
      status: 'OK',
      content: transformAKTESData(aktesSourceData as AKTESDataFromSource),
    });
  });

  it('Fetch fails', async () => {
    axMock.onGet(String(ApiUrls.AKTES)).replyOnce(500, []);

    const rs = await fetchAKTES('x', {
      profile: { authMethod: 'digid', profileType: 'private', id: 'bsnxxx' },
      token: 'xxxx',
    });

    expect(rs).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Error: Request failed with status code 500',
    });
  });
});
