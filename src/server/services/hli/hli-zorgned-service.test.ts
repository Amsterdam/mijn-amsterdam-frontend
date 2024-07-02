import { remoteApi } from '../../../test-utils';
import { AuthProfileAndToken } from '../../helpers/app';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-config-and-types';
import {
  fetchClientNummer,
  fetchNamenBetrokkenen,
  fetchZorgnedAanvragenHLI,
  forTesting,
} from './hli-zorgned-service';
import { ZorgnedPersoonsgegevensNAWResponse } from './regelingen-types';

import * as zorgnedService from '../zorgned/zorgned-service';

describe('hli-zorgned-service', () => {
  const authProfileAndToken: AuthProfileAndToken = {
    profile: {
      id: '123456789',
      sid: 'xxxxxx-sid-xxxxxx',
      profileType: 'private',
      authMethod: 'digid',
    },
    token: '',
  };

  test('volledigClientnummer', () => {
    const nr = forTesting.volledigClientnummer(1234567);
    expect(nr).toMatchInlineSnapshot(`"03630001234567"`);

    const nr2 = forTesting.volledigClientnummer(8888888888);
    expect(nr2).toMatchInlineSnapshot(`"03638888888888"`);
  });

  test('transformZorgnedClientNummerResponse', () => {
    const response = forTesting.transformZorgnedClientNummerResponse({
      persoon: {
        clientidentificatie: 567890,
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    expect(response).toMatchInlineSnapshot(`"03630000567890"`);

    const response2 = forTesting.transformZorgnedClientNummerResponse(
      {} as ZorgnedPersoonsgegevensNAWResponse
    );

    expect(response2).toBe(null);
  });

  test('fetchClientNummer success', async () => {
    remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
      persoon: {
        clientidentificatie: 567890,
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    const response = await fetchClientNummer('xxxx', authProfileAndToken);

    expect(response).toMatchInlineSnapshot(`
      {
        "content": "03630000567890",
        "status": "OK",
      }
    `);
  });

  test('fetchClientNummer fail', async () => {
    remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500);

    const response = await fetchClientNummer('xxxx', authProfileAndToken);

    expect(response).toMatchInlineSnapshot(`
      {
        "code": 500,
        "content": null,
        "message": "AxiosError: Request failed with status code 500",
        "status": "ERROR",
      }
    `);
  });

  test('transformZorgnedBetrokkeneNaamResponse', () => {
    const naam = forTesting.transformZorgnedBetrokkeneNaamResponse({
      persoon: {
        voorvoegsel: null,
        geboortenaam: 'Alex',
        voornamen: 'Flex',
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    expect(naam).toMatchInlineSnapshot(`"Flex Alex"`);

    const naam2 = forTesting.transformZorgnedBetrokkeneNaamResponse({
      persoon: {
        voorvoegsel: 'de',
        geboortenaam: 'Jarvis',
        voornamen: 'Baron',
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    expect(naam2).toMatchInlineSnapshot(`"Baron de Jarvis"`);

    const naam3 = forTesting.transformZorgnedBetrokkeneNaamResponse({
      persoon: null,
    } as unknown as ZorgnedPersoonsgegevensNAWResponse);

    expect(naam3).toBe(null);
  });

  test('fetchNamenBetrokkenen', async () => {
    remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
      persoon: {
        voorvoegsel: 'de',
        geboortenaam: 'Jarvis',
        voornamen: 'Baron',
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
      persoon: {
        voorvoegsel: null,
        geboortenaam: 'Alex',
        voornamen: 'Flex',
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    const response = await fetchNamenBetrokkenen(
      'xx2xxx',
      authProfileAndToken,
      ['1', '2']
    );

    expect(response).toMatchInlineSnapshot(`
      {
        "content": [
          "Baron de Jarvis",
          "Flex Alex",
        ],
        "status": "OK",
      }
    `);
  });

  test('assignIsActueel', () => {
    const aanvraag = {
      isActueel: false,
    } as ZorgnedAanvraagTransformed;

    forTesting.assignIsActueel(aanvraag);

    expect(aanvraag).toMatchInlineSnapshot(`
      {
        "isActueel": true,
      }
    `);

    const aanvraag2 = {
      isActueel: true,
      datumEindeGeldigheid: '2022-01-12',
    } as ZorgnedAanvraagTransformed;

    forTesting.assignIsActueel(aanvraag2);

    expect(aanvraag2).toMatchInlineSnapshot(`
      {
        "datumEindeGeldigheid": "2022-01-12",
        "isActueel": false,
      }
    `);
  });

  test('fetchZorgnedAanvragenHLI no content', async () => {
    const fetchAanvragenSpy = vitest
      .spyOn(zorgnedService, 'fetchAanvragen')
      .mockResolvedValueOnce({ content: [], status: 'OK' });

    const result = await fetchZorgnedAanvragenHLI(
      'xxx4xxx',
      authProfileAndToken
    );

    expect(fetchAanvragenSpy).toHaveBeenCalled();
    expect(result).toMatchInlineSnapshot(`
      {
        "content": [],
        "status": "OK",
      }
    `);
  });

  test('fetchZorgnedAanvragenHLI Einde geldigheid niet verstreken', async () => {
    const fetchAanvragenSpy = vitest
      .spyOn(zorgnedService, 'fetchAanvragen')
      .mockResolvedValueOnce({
        content: [
          {
            isActueel: false,
            datumEindeGeldigheid: '2032-01-01',
          } as ZorgnedAanvraagTransformed,
        ],
        status: 'OK',
      });

    const result = await fetchZorgnedAanvragenHLI(
      'xxx4xxx',
      authProfileAndToken
    );

    expect(fetchAanvragenSpy).toHaveBeenCalled();
    expect(result).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "datumEindeGeldigheid": "2032-01-01",
            "isActueel": true,
          },
        ],
        "status": "OK",
      }
    `);
  });

  test('fetchZorgnedAanvragenHLI Einde geldigheid verstreken', async () => {
    const fetchAanvragenSpy = vitest
      .spyOn(zorgnedService, 'fetchAanvragen')
      .mockResolvedValueOnce({
        content: [
          {
            isActueel: true,
            datumEindeGeldigheid: '2022-01-01',
          } as ZorgnedAanvraagTransformed,
        ],
        status: 'OK',
      });

    const result = await fetchZorgnedAanvragenHLI(
      'xxx4xxx',
      authProfileAndToken
    );

    expect(fetchAanvragenSpy).toHaveBeenCalled();
    expect(result).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "datumEindeGeldigheid": "2022-01-01",
            "isActueel": false,
          },
        ],
        "status": "OK",
      }
    `);
  });
});
