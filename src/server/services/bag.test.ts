import MockAdapter from 'axios-mock-adapter';
import { jsonCopy } from '../../universal/helpers';
import { ApiUrls } from '../config';
import bagData from '../mock-data/json/bag.json';
import { fetchBAG, formatBAGData } from './bag';
import { axiosRequest } from '../helpers/source-api-request';
import * as Sentry from '@sentry/node';

describe('BAG service', () => {
  const axMock = new MockAdapter(axiosRequest);
  const DUMMY_RESPONSE = jsonCopy(bagData);

  afterAll(() => {
    axMock.restore();
  });

  axMock
    .onGet(ApiUrls.BAG, { params: { q: 'straatje 25' } })
    .reply(200, DUMMY_RESPONSE);

  // Error response
  axMock.onGet(ApiUrls.BAG, { params: { q: 'undefined' } }).reply(500);

  it('should extraxt a lat/lon object', () => {
    expect(formatBAGData(bagData as any)).toStrictEqual({
      latlng: {
        lat: 52.372950494299445,
        lng: 4.834586581980725,
      },
    });
  });

  it('should have a null lat/lon', () => {
    bagData.results = [];
    expect(formatBAGData(bagData as any)).toStrictEqual({
      latlng: null,
    });
  });

  it('Bag api should reply correctly', async () => {
    const address = {
      straatnaam: 'straatje',
      huisnummer: 25,
    } as any;

    const rs = await fetchBAG('x', { x: 'saml' }, address);

    expect(rs).toStrictEqual({
      status: 'OK',
      content: {
        latlng: {
          lat: 52.372950494299445,
          lng: 4.834586581980725,
        },
      },
    });
  });

  it('Bag api should fail correct;y', async () => {
    const rs = await fetchBAG('x', { x: 'saml' }, {} as any);

    expect(rs).toStrictEqual({
      status: 'ERROR',
      message: 'Error: Request failed with status code 500',
      content: null,
    });
  });
});
