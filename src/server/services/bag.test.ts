import MockAdapter from 'axios-mock-adapter';
import { jsonCopy } from '../../universal/helpers';
import { Adres } from '../../universal/types';
import { ApiUrls } from '../config';
import { axiosRequest } from '../helpers/source-api-request';
import bagData from '../mock-data/json/bag.json';
import { fetchBAG } from './bag';

describe('BAG service', () => {
  const axMock = new MockAdapter(axiosRequest);
  const DUMMY_RESPONSE = jsonCopy(bagData);

  afterAll(() => {
    axMock.restore();
  });

  axMock
    .onGet(String(ApiUrls.BAG), { params: { q: 'straatje 25', features: 2 } })
    .reply(200, DUMMY_RESPONSE);

  // Error response
  axMock.onGet(String(ApiUrls.BAG), { params: { q: 'undefined' } }).reply(500);

  it('Bag api should reply correctly', async () => {
    const address = {
      straatnaam: 'straatje',
      huisnummer: 25,
      woonplaatsNaam: 'Amsterdam',
    } as unknown as Adres;

    const rs = await fetchBAG(
      'x',
      {
        token: 'xxxx',
        profile: { authMethod: 'digid', profileType: 'private' },
      },
      address
    );

    expect(rs).toStrictEqual({
      status: 'OK',
      content: {
        address,
        bagNummeraanduidingId: null,
        latlng: null,
      },
    });
  });

  it('Bag api should fail correct;y', async () => {
    // Request non-existing mock url
    const rs = await fetchBAG(
      'x',
      {
        token: 'xxxx',
        profile: { authMethod: 'digid', profileType: 'private' },
      },
      {} as any
    );

    expect(rs).toStrictEqual({
      status: 'ERROR',
      message: 'Kon geen correct zoek adres opmaken.',
      content: null,
    });
  });
});
