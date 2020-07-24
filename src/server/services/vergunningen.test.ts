import MockAdapter from 'axios-mock-adapter';
import { jsonCopy } from '../../universal/helpers';
import { ApiConfig } from '../config';
import { axiosRequest } from '../helpers';
import vergunningenData from '../mock-data/json/vergunningen.json';
import {
  fetchVergunningen,
  transformVergunningenData,
  VergunningenSourceData,
  fetchVergunningenGenerated,
} from './vergunningen';

describe('Vergunningen service', () => {
  const axMock = new MockAdapter(axiosRequest);
  const DUMMY_RESPONSE = jsonCopy(vergunningenData);

  const ORIGINAL_URL = ApiConfig.VERGUNNINGEN.url;
  const DUMMY_URL_1 = '/x';
  const DUMMY_URL_2 = '/y';
  const DUMMY_URL_3 = '/z';

  afterAll(() => {
    axMock.restore();
    ApiConfig.VERGUNNINGEN.url = ORIGINAL_URL;
  });

  axMock.onGet(DUMMY_URL_1).reply(200, DUMMY_RESPONSE);
  axMock.onGet(DUMMY_URL_2).reply(200, null);
  axMock.onGet(DUMMY_URL_3).reply(500, { message: 'fat chance!' });

  it('should format data correctly', () => {
    expect(
      transformVergunningenData(vergunningenData as VergunningenSourceData)
    ).toMatchSnapshot();
  });

  it('FetchVergunningen: should respond with a success response', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_1;
    const response = await fetchVergunningen('x', { x: 'saml' });
    const successResponse = {
      status: 'OK',
      content: transformVergunningenData(DUMMY_RESPONSE),
    };
    expect(response).toStrictEqual(successResponse);
  });

  it('should should respond with an empty list', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_2;
    const response = await fetchVergunningen('x', { x: 'saml' });
    const successResponse = {
      status: 'OK',
      content: [],
    };
    expect(response).toStrictEqual(successResponse);
  });

  it('should should respond with an empty list', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_3;
    const response = await fetchVergunningen('x', { x: 'saml' });
    const errorResponse = {
      content: null,
      message: 'Error: Request failed with status code 500',
      status: 'ERROR',
    };
    expect(response).toStrictEqual(errorResponse);
  });

  it('FetchVergunningenGenerated: should respond with a success response', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_1;
    const response = await fetchVergunningenGenerated(
      'x',
      { x: 'saml' },
      new Date('2020-06-23')
    );
    expect(response).toMatchSnapshot();
  });
});
