import MockAdapter from 'axios-mock-adapter';
import { AppRoutes } from '../../../universal/config';
import { jsonCopy } from '../../../universal/helpers';
import { ApiConfig } from '../../config';
import { axiosRequest } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import vergunningenData from '../../mock-data/json/vergunningen.json';
import {
  addLinks,
  fetchAllVergunningen,
  fetchVergunningenNotifications,
  transformVergunningenData,
  VergunningenSourceData,
} from './vergunningen';

describe('Vergunningen service', () => {
  const axMock = new MockAdapter(axiosRequest);
  const DUMMY_RESPONSE = jsonCopy(vergunningenData);

  const ORIGINAL_URL = ApiConfig.VERGUNNINGEN.url;
  const DUMMY_URL_1 = '/x';
  const DUMMY_URL_2 = '/y';
  const DUMMY_URL_3 = '/z';

  const authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private' },
    token: 'xxxxxx',
  };

  jest.useFakeTimers('modern').setSystemTime(new Date('2021-07-07').getTime());

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
    const response = await fetchAllVergunningen('x', authProfileAndToken);
    const successResponse = {
      status: 'OK',
      content: transformVergunningenData(DUMMY_RESPONSE),
    };
    expect(response).toStrictEqual(successResponse);
  });

  it('should should respond with an empty list', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_2;
    const response = await fetchAllVergunningen('x', authProfileAndToken);
    const successResponse = {
      status: 'OK',
      content: [],
    };
    expect(response).toStrictEqual(successResponse);
  });

  it('should should respond with an empty list if api returns error', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_3;
    const response = await fetchAllVergunningen('x', authProfileAndToken);
    const errorResponse = {
      content: null,
      message: 'Error: Request failed with status code 500',
      status: 'ERROR',
    };
    expect(response).toStrictEqual(errorResponse);
  });

  it('fetchVergunningenNotifications: should respond with a success response', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_1;
    const response = await fetchVergunningenNotifications(
      'x',
      authProfileAndToken,
      new Date('2020-06-23')
    );
    expect(response).toMatchSnapshot();
  });

  it('adds the links to the vergunningen', () => {
    const vergunningenWithLinks = addLinks(
      [DUMMY_RESPONSE.content[0]],
      AppRoutes['VERGUNNINGEN/DETAIL']
    );
    expect(vergunningenWithLinks).toMatchInlineSnapshot(`
      Array [
        Object {
          "caseType": "Parkeerontheffingen Blauwe zone particulieren",
          "dateDecision": null,
          "dateEnd": null,
          "dateRequest": "2022-09-01",
          "dateStart": "2022-09-09",
          "dateWorkflowActive": "2022-09-01",
          "decision": null,
          "description": "Ontheffing Blauwe Zone Bewoner",
          "documentsUrl": "/decosjoin/listdocuments/gAAAAABjKYDIOgDQc8saVY2ZLlB6GL7lYkkLmPGiyQQpkrtr_WsCzAaNTNGDJ4lZeOojHKiiJbDY7FIBAQd_xBOpIcb09p0QoPQRUtBLZ3UYBpcIeOnAVUHe6h_PVrLmoXfn7XKbL9yt",
          "id": "2191426354",
          "identifier": "Z/22/19795392",
          "kenteken": "GD-33-MV",
          "link": Object {
            "title": "Bekijk hoe het met uw aanvraag staat",
            "to": "/vergunningen/parkeerontheffingen-blauwe-zone-particulieren/2191426354",
          },
          "status": "Ontvangen",
          "title": "Parkeerontheffingen Blauwe zone particulieren",
        },
      ]
    `);
  });
});
