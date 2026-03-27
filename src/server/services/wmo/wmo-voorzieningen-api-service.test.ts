import type { WmoApiConfig } from './wmo-types.ts';
import {
  fetchMaApiVoorzieningen,
  forTesting,
} from './wmo-voorzieningen-api-service.ts';
import { remoteApi } from '../../../testing/utils.ts';

describe('wmo-voorzieningen-api-service', () => {
  describe('isMaApiPropertyConfigMatch', () => {
    it('should return true when all matchers match the voorziening', () => {
      const voorziening = {
        type: 'example',
        status: 'active',
      };

      const actionConfig = {
        match: {
          type: 'example',
          status: 'active',
        },
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(voorziening, actionConfig)
      ).toBe(true);
    });

    it('should return false when at least one matcher does not match the voorziening', () => {
      const voorziening = {
        type: 'example',
        status: 'inactive',
      };

      const actionConfig = {
        match: {
          type: 'example',
          status: 'active',
        },
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(voorziening, actionConfig)
      ).toBe(false);
    });

    it('should match different configurations based on property values', () => {
      const withLeveringsVorm = {
        productsoortCode: 'ABC',
        leveringsVorm: 'ZIN',
      };
      const actionConfig1 = {
        match: {
          productsoortCode: 'ABC',
          leveringsVorm: 'ZIN',
        },
        assign: {},
      };

      const noLeveringsVorm = {
        productsoortCode: 'ABC',
        leveringsVorm: '',
      };
      const actionConfig2 = {
        match: {
          productsoortCode: 'ABC',
          leveringsVorm: '',
        },
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(withLeveringsVorm, actionConfig1)
      ).toBe(true);
      expect(
        forTesting.isMaApiPropertyConfigMatch(noLeveringsVorm, actionConfig1)
      ).toBe(false);
      expect(
        forTesting.isMaApiPropertyConfigMatch(withLeveringsVorm, actionConfig2)
      ).toBe(false);
      expect(
        forTesting.isMaApiPropertyConfigMatch(noLeveringsVorm, actionConfig2)
      ).toBe(true);
    });

    it('should handle function matchers correctly', () => {
      const voorziening = {
        type: 'example',
        status: 'active',
        date: new Date('2023-01-01'),
      };

      const actionConfig: WmoApiConfig<typeof voorziening> = {
        match: {
          type: 'example',
          status: 'active',
          date: (voorziening) => voorziening.date < new Date('2024-01-01'),
        },
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(voorziening, actionConfig)
      ).toBe(true);
    });
  });

  describe('addMaApiPropsToVoorziening', () => {
    it('should add properties from matching action configs', () => {
      const voorziening = {
        type: 'example',
        status: 'active',
      };

      const apiPropsConfig: WmoApiConfig<typeof voorziening> = {
        match: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: ['reparatieverzoek'],
          maProductgroep: ['WRA'],
        },
      };

      const result = forTesting.addMaApiPropsToVoorziening(
        [apiPropsConfig],
        voorziening
      );

      expect(result).toEqual({
        ...voorziening,
        maActies: ['reparatieverzoek'],
        maProductgroep: ['WRA'],
      });
    });

    it('should merge and deduplicate array properties if they already exist', () => {
      const voorziening = {
        type: 'example',
        status: 'active',
      };

      const apiPropsConfig1: WmoApiConfig<typeof voorziening> = {
        match: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: ['reparatieverzoek'],
        },
      };

      const apiPropsConfig2: WmoApiConfig<typeof voorziening> = {
        match: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: ['stopzetten'],
        },
      };

      const result = forTesting.addMaApiPropsToVoorziening(
        [apiPropsConfig1, apiPropsConfig2],
        voorziening
      );

      expect(result).toEqual({
        ...voorziening,
        maActies: ['reparatieverzoek', 'stopzetten'],
      });
    });

    it('should not modify the voorziening if no configs match', () => {
      const voorziening = {
        type: 'example',
        status: 'active',
      };

      const apiPropsConfig: WmoApiConfig<typeof voorziening> = {
        match: {
          type: 'differentExample',
          status: 'inactive',
        },
        assign: {
          maActies: ['reparatieverzoek'],
        },
      };

      const result = forTesting.addMaApiPropsToVoorziening(
        [apiPropsConfig],
        voorziening
      );

      expect(result).toEqual(voorziening);
    });

    it('should not modify the voorziening if assign values are undefined', () => {
      const voorziening = {
        type: 'example',
        status: 'active',
      };

      const apiPropsConfig: WmoApiConfig<typeof voorziening> = {
        match: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: undefined,
          maProductgroep: undefined,
        },
      };

      const result = forTesting.addMaApiPropsToVoorziening(
        [apiPropsConfig],
        voorziening
      );

      expect(result).toEqual(voorziening);
    });

    it('should not mutate the input voorziening', () => {
      const voorziening = {
        type: 'example',
        status: 'active',
        maActies: ['reparatieverzoek'],
      };

      const apiPropsConfig1: WmoApiConfig<typeof voorziening> = {
        match: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: ['stopzetten'],
        },
      };

      const apiPropsConfig2: WmoApiConfig<typeof voorziening> = {
        match: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: ['reparatieverzoek'],
        },
      };

      const originalSnapshot = structuredClone(voorziening);

      const r1 = forTesting.addMaApiPropsToVoorziening(
        [apiPropsConfig1, apiPropsConfig2],
        voorziening
      );
      const r1Snapshot = structuredClone(r1);
      const r2 = forTesting.addMaApiPropsToVoorziening(
        [apiPropsConfig1, apiPropsConfig2],
        voorziening
      );

      expect(voorziening).toEqual(originalSnapshot);
      expect(r1).toEqual(r2);
      expect(r2).toEqual(r1Snapshot);
    });
  });

  describe('fetchMaApiVoorzieningen', () => {
    function getAanvraag(productsoortCode = 'WRA', leveringsvorm = 'ZIN') {
      return {
        identificatie: '912837sdfsdf198723',
        datumAanmelding: '2023-04-25',
        datumAanvraag: '2025-11-25',
        beschikking: {
          beschikkingNummer: 300111429,
          datumAfgifte: '2023-05-17',
          beschikteProducten: [
            {
              identificatie: '116841',
              product: {
                productsoortCode,
              },
              resultaat: 'toegewezen',
              toegewezenProduct: {
                datumIngangGeldigheid: '2023-05-06',
                datumEindeGeldigheid: null,
                leveringsvorm,
                leverancier: {
                  identificatie: 'LA0994',
                  omschrijving: 'Gebr Koenen B.V.',
                },
              },
            },
          ],
        },
        documenten: [],
      };
    }
    function getZorgnedAanvragenResponse(
      aanvragen: ReturnType<typeof getAanvraag>[]
    ) {
      return {
        _embedded: {
          aanvraag: aanvragen,
        },
      };
    }

    test('should fetch voorzieningen and add MA API props based on config', async () => {
      remoteApi
        .post('/zorgned/aanvragen')
        .reply(200, getZorgnedAanvragenResponse([getAanvraag()]));

      const response = await fetchMaApiVoorzieningen('123456789', undefined, [
        {
          match: {
            leveringsVorm: 'ZIN',
            isActueel: true,
            productsoortCode: ['WRA'],
            datumEindeLevering: null,
          },
          assign: {
            maActies: ['reparatieverzoek'],
            maProductgroep: ['een-naam'],
          },
        },
      ]);

      expect(response.content?.[0]).toMatchObject({
        maActies: ['reparatieverzoek'],
        maProductgroep: ['een-naam'],
        leverancier: 'Gebr Koenen B.V.',
        leverancierIdentificatie: 'LA0994',
        leveringsVorm: 'ZIN',
        productsoortCode: 'WRA',
      });
    });

    test('should filter voorzieningen based on options', async () => {
      remoteApi
        .post('/zorgned/aanvragen')
        .reply(
          200,
          getZorgnedAanvragenResponse([getAanvraag(), getAanvraag('ABC')])
        );

      const response = await fetchMaApiVoorzieningen(
        '123456789',
        {
          maActies: ['reparatieverzoek'],
          maProductgroep: ['een-naam'] as unknown as ['WRA'],
        },
        [
          {
            match: {
              leveringsVorm: 'ZIN',
              isActueel: true,
              productsoortCode: ['WRA'],
              datumEindeLevering: null,
            },
            assign: {
              maActies: ['reparatieverzoek'],
              maProductgroep: ['een-naam'],
            },
          },
        ]
      );

      expect(response.content?.length).toBe(1);
      expect(response.content?.[0].productsoortCode).toBe('WRA');
    });

    test('should return empty array if no voorzieningen match the filters', async () => {
      remoteApi
        .post('/zorgned/aanvragen')
        .reply(
          200,
          getZorgnedAanvragenResponse([getAanvraag(), getAanvraag('ABC')])
        );

      const response = await fetchMaApiVoorzieningen(
        '123456789',
        {
          maActies: ['non-existing-action'] as unknown as ['reparatieverzoek'],
          maProductgroep: ['non-existing-productgroep'] as unknown as ['WRA'],
        },
        [
          {
            match: {
              leveringsVorm: 'ZIN',
            },
            assign: {
              maActies: ['reparatieverzoek'],
              maProductgroep: ['een-naam'],
            },
          },
        ]
      );

      expect(response.content).toEqual([]);
    });

    test('should handle API errors gracefully', async () => {
      remoteApi
        .post('/zorgned/aanvragen')
        .replyWithError('Something went wrong');

      const response = await fetchMaApiVoorzieningen('123456789');

      expect(response.status).toBe('ERROR');
      expect(response.content).toBeNull();
    });
  });
});
