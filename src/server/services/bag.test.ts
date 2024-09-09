import nock from 'nock';
import { describe, expect, it } from 'vitest';

import bagData from '../../../mocks/fixtures/bag.json';
import { jsonCopy } from '../../universal/helpers/utils';
import { Adres } from '../../universal/types';
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

    const rs = await fetchBAG('x', address);

    expect(rs).toStrictEqual({
      status: 'OK',
      content: {
        address,
        bagNummeraanduidingId: null,
        latlng: null,
      },
    });
  });

  it('Bag api should fail correctly', async () => {
    nock('http://api.data.amsterdam.nl')
      .get('/bag', { params: { q: 'undefined' } })
      .reply(500);
    // Request non-existing mock url
    const rs = await fetchBAG('x', {} as any);

    expect(rs).toStrictEqual({
      status: 'ERROR',
      message: 'Kon geen correct zoek adres opmaken.',
      content: null,
    });
  });
});
