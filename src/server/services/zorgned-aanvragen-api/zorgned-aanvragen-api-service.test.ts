import type { AanvragenApiConfig } from './zorgned-aanvragen-api-types.ts';
import {
  fetchMaApiAanvragen,
  forTesting,
} from './zorgned-aanvragen-api-service.ts';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import type { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types.ts';

describe('zorgned-aanvragen-api-service', () => {
  describe('isMaApiPropertyConfigMatch', () => {
    it('should return true when all matchers match the aanvraag', () => {
      const aanvraag = {
        type: 'example',
        status: 'active',
      };

      const actionConfig = {
        include: {
          type: 'example',
          status: 'active',
        },
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(aanvraag, actionConfig)
      ).toBe(true);
    });

    it('should return false when at least one matcher does not match the aanvraag', () => {
      const aanvraag = {
        type: 'example',
        status: 'inactive',
      };

      const actionConfig = {
        include: {
          type: 'example',
          status: 'active',
        },
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(aanvraag, actionConfig)
      ).toBe(false);
    });

    it('should return true if there are no matchers', () => {
      const aanvraag = {
        type: 'example',
        status: 'active',
      };

      const actionConfig = {
        include: {},
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(aanvraag, actionConfig)
      ).toBe(true);
    });

    it('should return false if there are no exclude matchers', () => {
      const aanvraag = {
        type: 'example',
        status: 'active',
      };

      const actionConfig = {
        include: {},
        exclude: {},
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(aanvraag, actionConfig, 'exclude')
      ).toBe(false);
    });

    it('should return false if there are no exclude matchers that match the aanvraag', () => {
      const aanvraag = {
        type: 'example',
        status: 'active',
      };

      const actionConfig = {
        include: {},
        exclude: {
          type: 'differentExample',
          status: 'inactive',
        },
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(aanvraag, actionConfig, 'exclude')
      ).toBe(false);
    });

    it('should return true when all exclude matchers match the aanvraag', () => {
      const aanvraag = {
        type: 'example',
        status: 'active',
      };

      const actionConfig = {
        include: {},
        exclude: {
          type: 'example',
          status: 'active',
        },
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(aanvraag, actionConfig, 'exclude')
      ).toBe(true);
    });

    it('should include 2 aanvragen based on productsoortCode and exclude 1 based on productIdentificatie', () => {
      const aanvraag1 = {
        productsoortCode: 'WRA',
        productIdentificatie: 'not-excluded-id',
      } as unknown as ZorgnedAanvraagTransformed;

      const aanvraag2 = {
        productsoortCode: 'WRA',
        productIdentificatie: 'excluded-id',
      } as unknown as ZorgnedAanvraagTransformed;

      const actionConfig = {
        include: {
          productsoortCode: 'WRA',
        },
        exclude: {
          productIdentificatie: 'excluded-id',
        },
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(
          aanvraag1,
          actionConfig,
          'include'
        )
      ).toBe(true);
      expect(
        forTesting.isMaApiPropertyConfigMatch(
          aanvraag1,
          actionConfig,
          'exclude'
        )
      ).toBe(false);
      expect(
        forTesting.isMaApiPropertyConfigMatch(
          aanvraag2,
          actionConfig,
          'include'
        )
      ).toBe(true);
      expect(
        forTesting.isMaApiPropertyConfigMatch(
          aanvraag2,
          actionConfig,
          'exclude'
        )
      ).toBe(true);
    });

    it('should match different configurations based on property values', () => {
      const withLeveringsVorm = {
        productsoortCode: 'ABC',
        leveringsVorm: 'ZIN',
      };
      const actionConfig1 = {
        include: {
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
        include: {
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
      const aanvraag = {
        type: 'example',
        status: 'active',
        date: new Date('2023-01-01'),
      };

      const actionConfig: AanvragenApiConfig<typeof aanvraag> = {
        include: {
          type: 'example',
          status: 'active',
          date: (aanvraag) => aanvraag.date < new Date('2024-01-01'),
        },
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(aanvraag, actionConfig)
      ).toBe(true);
    });
  });

  describe('addMaApiPropsToAanvraag', () => {
    it('should add properties from matching action configs', () => {
      const aanvraag = {
        type: 'example',
        status: 'active',
      } as unknown as ZorgnedAanvraagTransformed;

      const apiPropsConfig = {
        include: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: ['reparatieverzoek'],
          maProductgroep: 'WRA',
        },
      } as AanvragenApiConfig<ZorgnedAanvraagTransformed>;

      const result = forTesting.addMaApiPropsToAanvraag(
        [apiPropsConfig],
        aanvraag
      );

      expect(result).toEqual({
        ...aanvraag,
        maActies: ['reparatieverzoek'],
        maProductgroep: 'WRA',
      });
    });

    it('should include / exclude aanvragen based on multiple configs and their include and exclude matchers', () => {
      const aanvraag = {
        type: 'example',
        status: 'active',
      } as unknown as ZorgnedAanvraagTransformed;
      const aanvraag2 = {
        type: 'example',
        status: 'active',
        id: 'excluded-id',
      } as unknown as ZorgnedAanvraagTransformed;

      const apiPropsConfig = {
        include: {
          type: 'example',
          status: 'active',
        },
        exclude: {
          id: 'excluded-id',
        },
        assign: {
          maActies: ['assign-foo-bar'],
        },
      } as AanvragenApiConfig<ZorgnedAanvraagTransformed>;

      const aanvraagTransformed1 = forTesting.addMaApiPropsToAanvraag(
        [apiPropsConfig],
        aanvraag
      );

      expect(aanvraagTransformed1).toHaveProperty('maActies', [
        'assign-foo-bar',
      ]);

      const aanvraagTransformed2 = forTesting.addMaApiPropsToAanvraag(
        [apiPropsConfig],
        aanvraag2
      );

      expect(aanvraagTransformed2).not.toHaveProperty('maActies');
    });

    it('should merge and deduplicate array properties if they already exist', () => {
      const aanvraag = {
        type: 'example',
        status: 'active',
      } as unknown as ZorgnedAanvraagTransformed;

      const apiPropsConfig1 = {
        include: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: ['reparatieverzoek'],
        },
      } as AanvragenApiConfig<ZorgnedAanvraagTransformed>;

      const apiPropsConfig2 = {
        include: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: ['stopzetten'],
        },
      } as AanvragenApiConfig<ZorgnedAanvraagTransformed>;

      const result = forTesting.addMaApiPropsToAanvraag(
        [apiPropsConfig1, apiPropsConfig2],
        aanvraag
      );

      expect(result).toEqual({
        ...aanvraag,
        maActies: ['reparatieverzoek', 'stopzetten'],
      });
    });

    it('should not modify the aanvraag if no configs match', () => {
      const aanvraag = {
        type: 'example',
        status: 'active',
      } as unknown as ZorgnedAanvraagTransformed;

      const apiPropsConfig: AanvragenApiConfig<typeof aanvraag> = {
        include: {
          type: 'differentExample',
          status: 'inactive',
        },
        assign: {
          maActies: ['reparatieverzoek'],
        },
      } as AanvragenApiConfig<ZorgnedAanvraagTransformed>;

      const result = forTesting.addMaApiPropsToAanvraag(
        [apiPropsConfig],
        aanvraag
      );

      expect(result).toEqual(aanvraag);
    });

    it('should not modify the aanvraag if assign values are undefined', () => {
      const aanvraag = {
        type: 'example',
        status: 'active',
      } as unknown as ZorgnedAanvraagTransformed;

      const apiPropsConfig: AanvragenApiConfig<typeof aanvraag> = {
        include: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: undefined,
          maProductgroep: undefined,
        },
      } as AanvragenApiConfig<ZorgnedAanvraagTransformed>;

      const result = forTesting.addMaApiPropsToAanvraag(
        [apiPropsConfig],
        aanvraag
      );

      expect(result).toEqual(aanvraag);
    });

    it('should not mutate the input aanvraag', () => {
      const aanvraag = {
        type: 'example',
        status: 'active',
        maActies: ['reparatieverzoek'],
      } as unknown as ZorgnedAanvraagTransformed;

      const apiPropsConfig1 = {
        include: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: ['stopzetten'],
        },
      } as AanvragenApiConfig<ZorgnedAanvraagTransformed>;

      const apiPropsConfig2 = {
        include: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: ['reparatieverzoek'],
        },
      } as AanvragenApiConfig<ZorgnedAanvraagTransformed>;

      const originalSnapshot = structuredClone(aanvraag);

      const r1 = forTesting.addMaApiPropsToAanvraag(
        [apiPropsConfig1, apiPropsConfig2],
        aanvraag
      );
      const r1Snapshot = structuredClone(r1);
      const r2 = forTesting.addMaApiPropsToAanvraag(
        [apiPropsConfig1, apiPropsConfig2],
        aanvraag
      );

      expect(aanvraag).toEqual(originalSnapshot);
      expect(r1).toEqual(r2);
      expect(r2).toEqual(r1Snapshot);
    });
  });

  describe('fetch aanvragen', () => {
    function createAanvraag(
      overrides: Partial<ZorgnedAanvraagTransformed> = {}
    ): ZorgnedAanvraagTransformed {
      return {
        betrokkenen: [],
        datumAanvraag: '2025-01-01',
        datumBeginLevering: '2024-01-01',
        datumBesluit: '2025-01-02',
        datumEindeGeldigheid: null,
        datumEindeLevering: null,
        datumIngangGeldigheid: '2024-01-01',
        datumOpdrachtLevering: null,
        datumToewijzing: null,
        procesAanvraagOmschrijving: null,
        documenten: [],
        id: 'aanvraag-1',
        prettyID: 'aanvraag-1',
        procesIdentificatie: 'proces-1',
        procesMeldingIdentificatie: null,
        isActueel: true,
        leverancier: 'Gebr Koenen B.V.',
        leverancierIdentificatie: 'LA0994',
        leveringsVorm: 'ZIN',
        productsoortCode: 'WRA',
        productIdentificatie: 'LLVAVG',
        beschiktProductIdentificatie: 'beschikt-1',
        beschikkingNummer: 300111429,
        resultaat: 'toegewezen',
        titel: 'Aanvraag',
        ...overrides,
      } as ZorgnedAanvraagTransformed;
    }

    describe('fetchMaApiAanvragen', () => {
      test('should combine fetched service responses and add MA API props based on config', () => {
        const response = fetchMaApiAanvragen(
          [
            apiSuccessResult([
              createAanvraag({
                id: 'wmo-1',
                productsoortCode: 'LLV',
                productIdentificatie: 'LLVAVG',
              }),
            ]),
            apiSuccessResult([]),
            apiSuccessResult([]),
          ],
          undefined,
          [
            {
              include: {
                isActueel: true,
                productIdentificatie: ['LLVAVG'],
              },
              assign: {
                maActies: ['stopzetten-tijdelijk'],
                maProductgroep: 'een-naam',
              },
            },
          ]
        );

        expect(response.content?.[0]).toMatchObject({
          maActies: ['stopzetten-tijdelijk'],
          maProductgroep: 'een-naam',
          leverancier: 'Gebr Koenen B.V.',
          leverancierIdentificatie: 'LA0994',
          leveringsVorm: 'ZIN',
          productsoortCode: 'LLV',
          productIdentificatie: 'LLVAVG',
        });
      });

      test('should filter aanvragen based on options', () => {
        const response = fetchMaApiAanvragen(
          [
            apiSuccessResult([
              createAanvraag({ id: 'wmo-1', productsoortCode: 'WRA' }),
              createAanvraag({ id: 'wmo-2', productsoortCode: 'ABC' }),
            ]),
            apiSuccessResult([]),
            apiSuccessResult([]),
          ],
          {
            maActies: ['reparatieverzoek'],
            maProductgroep: ['een-naam'] as unknown as ['WRA'],
          },
          [
            {
              include: {
                leveringsVorm: 'ZIN',
                isActueel: true,
                productsoortCode: ['WRA'],
                datumEindeLevering: null,
              },
              assign: {
                maActies: ['reparatieverzoek'],
                maProductgroep: 'een-naam',
              },
            },
          ]
        );

        expect(response.content?.length).toBe(1);
        expect(response.content?.[0].productsoortCode).toBe('WRA');
      });

      test('should handle API errors gracefully', () => {
        const response = fetchMaApiAanvragen([
          apiSuccessResult([]),
          apiErrorResult('Something went wrong', null, 500),
          apiSuccessResult([]),
        ]);

        expect(response.status).toBe('ERROR');
        expect(response.content).toBeNull();
      });
    });

    describe('fetchMaApiAanvraagById', () => {
      test('should fetch a single aanvraag by ID and add MA API props based on config', () => {
        const response = forTesting.fetchMaApiAanvraagById(
          [
            apiSuccessResult([
              createAanvraag({
                id: 'target-id',
                productsoortCode: 'WRA',
              }),
            ]),
            apiSuccessResult([]),
            apiSuccessResult([]),
          ],
          'target-id',
          [
            {
              include: {
                productsoortCode: ['WRA'],
              },
              assign: {
                maActies: ['stopzetten'],
                maProductgroep: 'WRA',
              },
            },
          ]
        );

        expect(response.content).toMatchObject({
          maActies: ['stopzetten'],
          maProductgroep: 'WRA',
          leverancier: 'Gebr Koenen B.V.',
          leverancierIdentificatie: 'LA0994',
          leveringsVorm: 'ZIN',
          productsoortCode: 'WRA',
        });
      });

      test('should return an error if the aanvraag with the specified ID is not found', () => {
        const response = forTesting.fetchMaApiAanvraagById(
          [apiSuccessResult([]), apiSuccessResult([]), apiSuccessResult([])],
          'non-existing-id'
        );

        expect(response.status).toBe('ERROR');
        expect(response.status === 'ERROR' && response.message).toBe(
          'No aanvraag found with id non-existing-id'
        );
        expect(response.status === 'ERROR' && response.code).toBe(404);
      });
    });
  });
});
