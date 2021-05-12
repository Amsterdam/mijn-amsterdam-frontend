import MockAdapter from 'axios-mock-adapter';
import { jsonCopy } from '../../universal/helpers';
import { ApiConfig } from '../config';
import { axiosRequest } from '../helpers';
import toeristischeVerhuurRegistratiesData from '../mock-data/json/registraties-toeristische-verhuur.json';
import vergunningenData from '../mock-data/json/vergunningen.json';
import { fetchToeristischeVerhuur } from './toeristische-verhuur';
import { toeristischeVerhuurVergunningTypes } from './vergunningen';

describe('Toeristische verhuur service', () => {
  const axMock = new MockAdapter(axiosRequest);
  const VERGUNNINGEN_DUMMY_RESPONSE = jsonCopy(vergunningenData);
  const REGISTRATIES_DUMMY_RESPONSE = jsonCopy(
    toeristischeVerhuurRegistratiesData
  );

  const TOERISTISCHE_VERHUUR_REGISTRATIES_URL =
    ApiConfig.TOERISTISCHE_VERHUUR_REGISTRATIES.url;
  const TOERISTISCHE_VERHUUR_VERGUNNINGEN_URL = ApiConfig.VERGUNNINGEN.url;

  const DUMMY_URL_REGISTRATIES = '/registraties';
  const DUMMY_URL_VERGUNNINGEN = '/vergunningen';
  const DUMMY_URL_NULL_CONTENT = '/null-content';
  const DUMMY_URL_ERROR = '/error-response';

  afterAll(() => {
    axMock.restore();
    ApiConfig.VERGUNNINGEN.url = TOERISTISCHE_VERHUUR_VERGUNNINGEN_URL;
    ApiConfig.TOERISTISCHE_VERHUUR_REGISTRATIES.url = TOERISTISCHE_VERHUUR_REGISTRATIES_URL;
  });

  axMock.onGet(DUMMY_URL_REGISTRATIES).reply(200, REGISTRATIES_DUMMY_RESPONSE);
  axMock.onGet(DUMMY_URL_VERGUNNINGEN).reply(200, VERGUNNINGEN_DUMMY_RESPONSE);

  axMock.onGet(DUMMY_URL_NULL_CONTENT).reply(200, null);
  axMock.onGet(DUMMY_URL_ERROR).reply(500, { message: 'fat chance!' });

  it('Should respond with both vergunningen and registraties', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_VERGUNNINGEN;
    ApiConfig.TOERISTISCHE_VERHUUR_REGISTRATIES.url = DUMMY_URL_REGISTRATIES;

    const response = await fetchToeristischeVerhuur('x', { x: 'saml' });

    expect(response.content.registraties?.length).toBeGreaterThan(0);

    for (const registratie of response.content.registraties!) {
      expect(typeof registratie.registrationNumber).toBe('string');
      expect(typeof registratie.street).toBe('string');
      expect(typeof registratie.houseNumber).toBe('string');
      expect(typeof registratie.postalCode).toBe('string');
    }

    expect(
      response.content.vergunningen?.every((vergunning) =>
        toeristischeVerhuurVergunningTypes.includes(vergunning.caseType)
      )
    ).toBe(true);
  });

  it('Should respond with 1 failed dependency', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_ERROR;
    ApiConfig.TOERISTISCHE_VERHUUR_REGISTRATIES.url = DUMMY_URL_REGISTRATIES;

    const response = await fetchToeristischeVerhuur('x', { x: 'saml' });

    expect(response.content.registraties?.length).toBeGreaterThan(0);
    expect(response.content.vergunningen?.length).toBe(0);
    expect(response.failedDependencies?.vergunningen).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Error: Request failed with status code 500',
    });
  });

  it('Should respond with 2 failed dependencies', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_ERROR;
    ApiConfig.TOERISTISCHE_VERHUUR_REGISTRATIES.url = DUMMY_URL_ERROR;

    const response = await fetchToeristischeVerhuur('x', { x: 'saml' });

    expect(response.content.registraties?.length).toBe(0);
    expect(response.content.vergunningen?.length).toBe(0);
    expect(response.failedDependencies?.vergunningen).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Error: Request failed with status code 500',
    });
    expect(response.failedDependencies?.registraties).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Error: Request failed with status code 500',
    });
  });
});
