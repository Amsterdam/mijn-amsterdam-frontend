import {
  fetchAdministratienummer,
  fetchZorgnedAanvragenHLI,
  forTesting,
} from './hli-zorgned-service';
import { remoteApi } from '../../../testing/utils';
import * as zorgnedService from '../zorgned/zorgned-service';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedPersoonsgegevensNAWResponse,
} from '../zorgned/zorgned-types';
import { AV_CZM } from './status-line-items/regeling-czm';

describe('hli-zorgned-service', () => {
  test('transformToAdministratienummer', () => {
    const nr = forTesting.transformToAdministratienummer(1234567);
    expect(nr).toBe('03630001234567');

    const nr2 = forTesting.transformToAdministratienummer(8888888888);
    expect(nr2).toBe('03638888888888');
  });

  test('transformZorgnedClientNummerResponse', () => {
    const response = forTesting.transformZorgnedClientNummerResponse({
      persoon: {
        clientidentificatie: 567890,
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    expect(response).toBe('03630000567890');

    const response2 = forTesting.transformZorgnedClientNummerResponse(
      {} as ZorgnedPersoonsgegevensNAWResponse
    );

    expect(response2).toBe(null);
  });

  describe('fetchAdministratienummer', () => {
    const persoongegevensURL = '/zorgned/persoonsgegevensNAW';

    test('Success response', async () => {
      remoteApi.post(persoongegevensURL).reply(200, {
        persoon: {
          clientidentificatie: 567890,
        },
      } as ZorgnedPersoonsgegevensNAWResponse);

      const BSN = '123456789';
      const response = await fetchAdministratienummer(BSN);

      expect(response).toStrictEqual({
        content: '03630000567890',
        status: 'OK',
      });
    });

    test('No person found in system response', async () => {
      remoteApi.post(persoongegevensURL).reply(404);

      const BSN = '4567899';
      const response = await fetchAdministratienummer(BSN);

      expect(response).toStrictEqual({
        content: null,
        status: 'OK',
      });
    });

    test('Server error response', async () => {
      remoteApi.post(persoongegevensURL).reply(500);

      const BSN = '0986687';
      const response = await fetchAdministratienummer(BSN);

      expect(response).toStrictEqual({
        code: 500,
        content: null,
        message: 'Request failed with status code 500',
        status: 'ERROR',
      });
    });
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

    const aanvraag5 = {
      isActueel: true,
      datumIngangGeldigheid: '2024-06-01',
      resultaat: 'toegewezen',
    } as ZorgnedAanvraagTransformed;

    forTesting.isActueel(aanvraag5);

    expect(forTesting.isActueel(aanvraag5)).toBe(true);
  });

  test('fetchZorgnedAanvragenHLI no content', async () => {
    const fetchAanvragenSpy = vitest
      .spyOn(zorgnedService, 'fetchAanvragenWithRelatedPersons')
      .mockResolvedValueOnce({ content: [], status: 'OK' });

    const BSN = '123456789';
    const result = await fetchZorgnedAanvragenHLI(BSN);

    expect(fetchAanvragenSpy).toHaveBeenCalled();
    expect(result).toStrictEqual({
      content: [],
      status: 'OK',
    });
  });

  test('fetchZorgnedAanvragenHLI Einde geldigheid niet verstreken', async () => {
    const fetchAanvragenSpy = vitest
      .spyOn(zorgnedService, 'fetchAanvragenWithRelatedPersons')
      .mockResolvedValueOnce({
        content: [
          {
            isActueel: false,
            datumEindeGeldigheid: '2032-01-01',
            datumIngangGeldigheid: '2024-08-01',
            titel: 'test',
            documenten: [],
            productIdentificatie: AV_CZM,
          } as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed,
        ],
        status: 'OK',
      });

    const BSN = '987987234';
    const result = await fetchZorgnedAanvragenHLI(BSN);

    expect(fetchAanvragenSpy).toHaveBeenCalled();

    expect(result).toStrictEqual({
      content: [
        {
          datumEindeGeldigheid: '2032-01-01',
          documenten: [],
          datumIngangGeldigheid: '2024-08-01',
          isActueel: true,
          productIdentificatie: 'AV-CZM',
          titel: 'Collectieve zorgverzekering',
        },
      ],
      status: 'OK',
    });
  });

  test('fetchZorgnedAanvragenHLI Einde geldigheid verstreken', async () => {
    const fetchAanvragenSpy = vitest
      .spyOn(zorgnedService, 'fetchAanvragenWithRelatedPersons')
      .mockResolvedValueOnce({
        content: [
          {
            isActueel: true,
            datumEindeGeldigheid: '2022-01-01',
            documenten: [],
            titel: 'test',
          } as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed,
        ],
        status: 'OK',
      });

    const BSN = '9098234';
    const result = await fetchZorgnedAanvragenHLI(BSN);

    expect(fetchAanvragenSpy).toHaveBeenCalled();
    expect(result).toStrictEqual({
      content: [
        {
          datumEindeGeldigheid: '2022-01-01',
          documenten: [],
          isActueel: false,
          titel: 'test',
        },
      ],
      status: 'OK',
    });
  });
});
