import nock from 'nock';
import { describe, expect, it } from 'vitest';
import { jsonCopy } from '../../universal/helpers';
import { Adres } from '../../universal/types';
import bagData from '../mock-data/json/bag.json';
import { fetchBAG } from './bag';

describe('BAG service', () => {
  const DUMMY_RESPONSE = jsonCopy(bagData);

  it('Bag api should reply correctly', async () => {
    nock('https://api.data.amsterdam.nl')
      .get('/atlas/search/adres/?q=straatje 25&features=2')
      .reply(200, DUMMY_RESPONSE);

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
    nock('http://api.data.amsterdam.nl')
      .get('/bag', { params: { q: 'undefined' } })
      .reply(500);
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
