import { remoteApi } from '../../../test-utils';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedPersoonsgegevensNAWResponse,
} from '../zorgned/zorgned-config-and-types';
import {
  fetchAdministratienummer,
  fetchNamenBetrokkenen,
  fetchZorgnedAanvragenHLI,
  forTesting,
} from './hli-zorgned-service';

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

  test('transformToAdministratienummer', () => {
    const nr = forTesting.transformToAdministratienummer(1234567);
    expect(nr).toMatchInlineSnapshot(`"03630001234567"`);

    const nr2 = forTesting.transformToAdministratienummer(8888888888);
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

  test('fetchAdministratienummer success', async () => {
    remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
      persoon: {
        clientidentificatie: 567890,
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    const response = await fetchAdministratienummer(
      'x0xx',
      authProfileAndToken
    );

    expect(response).toMatchInlineSnapshot(`
      {
        "content": "03630000567890",
        "status": "OK",
      }
    `);
  });

  test('fetchAdministratienummer fail', async () => {
    remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500);

    const response = await fetchAdministratienummer(
      'x2xx',
      authProfileAndToken
    );

    expect(response).toMatchInlineSnapshot(`
      {
        "code": 500,
        "content": null,
        "message": "Request failed with status code 500",
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

    expect(naam).toMatchInlineSnapshot(`"Flex"`);

    const naam2 = forTesting.transformZorgnedBetrokkeneNaamResponse({
      persoon: {
        voorvoegsel: 'de',
        geboortenaam: 'Jarvis',
        voornamen: 'Baron',
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    expect(naam2).toMatchInlineSnapshot(`"Baron"`);

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

    const response = await fetchNamenBetrokkenen('xx2xxx', ['1', '2']);

    expect(response).toMatchInlineSnapshot(`
      {
        "content": [
          "Baron",
          "Flex",
        ],
        "status": "OK",
      }
    `);
  });

  test('isActueel', () => {
    const aanvraag = {
      isActueel: false,
    } as ZorgnedAanvraagTransformed;

    expect(forTesting.isActueel(aanvraag)).toBe(false);

    const aanvraag3 = {
      isActueel: false,
      datumIngangGeldigheid: '2022-01-12',
      datumEindeGeldigheid: '2082-01-12',
    } as ZorgnedAanvraagTransformed;

    expect(forTesting.isActueel(aanvraag3)).toBe(true);

    const aanvraag4 = {
      isActueel: true,
      datumEindeGeldigheid: '2082-01-12',
    } as ZorgnedAanvraagTransformed;

    expect(forTesting.isActueel(aanvraag4)).toBe(false);

    const aanvraag2 = {
      isActueel: true,
      datumIngangGeldigheid: '2021-01-12',
      datumEindeGeldigheid: '2022-01-12',
    } as ZorgnedAanvraagTransformed;

    forTesting.isActueel(aanvraag2);

    expect(forTesting.isActueel(aanvraag2)).toBe(false);
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
            datumIngangGeldigheid: '2024-08-01',
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
            "datumIngangGeldigheid": "2024-08-01",
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
