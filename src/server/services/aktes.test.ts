import { describe, expect, it } from 'vitest';
import { remoteApi } from '../../test-utils';
import { jsonCopy } from '../../universal/helpers';
import aktesSourceData from '../mock-data/json/aktes.json';
import { AKTESDataFromSource, fetchAKTES, transformAKTESData } from './aktes';

describe('Aktes service', () => {
  const DUMMY_RESPONSE = jsonCopy(aktesSourceData);

  it('Should fetch the data', async () => {
    remoteApi.get('/aktes/aktes').reply(200, DUMMY_RESPONSE);

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
    remoteApi.get('/aktes/aktes').replyWithError('No can do!');

    const rs = await fetchAKTES('x', {
      profile: { authMethod: 'digid', profileType: 'private', id: 'bsnxxx' },
      token: 'xxxx',
    });

    expect(rs).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Error: No can do!',
    });
  });
});
