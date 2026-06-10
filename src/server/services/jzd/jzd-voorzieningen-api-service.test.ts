import type { JzdApiConfig } from './jzd-types.ts';
import {
  fetchMaApiVoorzieningen,
  forTesting,
} from './jzd-voorzieningen-api-service.ts';
import { remoteApi } from '../../../testing/utils.ts';
import type { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types.ts';

describe('jzd-voorzieningen-api-service', () => {
  describe('isMaApiPropertyConfigMatch', () => {
    it('should return true when all matchers match the voorziening', () => {
      const voorziening = {
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
        forTesting.isMaApiPropertyConfigMatch(voorziening, actionConfig)
      ).toBe(true);
    });

    it('should return false when at least one matcher does not match the voorziening', () => {
      const voorziening = {
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
        forTesting.isMaApiPropertyConfigMatch(voorziening, actionConfig)
      ).toBe(false);
    });

    it('should return true if there are no matchers', () => {
      const voorziening = {
        type: 'example',
        status: 'active',
      };

      const actionConfig = {
        include: {},
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(voorziening, actionConfig)
      ).toBe(true);
    });

    it('should return false if there are no exclude matchers', () => {
      const voorziening = {
        type: 'example',
        status: 'active',
      };

      const actionConfig = {
        include: {},
        exclude: {},
        assign: {},
      };

      expect(
        forTesting.isMaApiPropertyConfigMatch(
          voorziening,
          actionConfig,
          'exclude'
        )
      ).toBe(false);
    });

    it('should return false if there are no exclude matchers that match the voorziening', () => {
      const voorziening = {
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
        forTesting.isMaApiPropertyConfigMatch(
          voorziening,
          actionConfig,
          'exclude'
        )
      ).toBe(false);
    });

    it('should return true when all exclude matchers match the voorziening', () => {
      const voorziening = {
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
        forTesting.isMaApiPropertyConfigMatch(
          voorziening,
          actionConfig,
          'exclude'
        )
      ).toBe(true);
    });

    it('should include 2 voorzieningen based on productsoortCode and exclude 1 based on productIdentificatie', () => {
      const voorziening1 = {
        productsoortCode: 'WRA',
        productIdentificatie: 'not-excluded-id',
      } as unknown as ZorgnedAanvraagTransformed;

      const voorziening2 = {
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
          voorziening1,
          actionConfig,
          'include'
        )
      ).toBe(true);
      expect(
        forTesting.isMaApiPropertyConfigMatch(
          voorziening1,
          actionConfig,
          'exclude'
        )
      ).toBe(false);
      expect(
        forTesting.isMaApiPropertyConfigMatch(
          voorziening2,
          actionConfig,
          'include'
        )
      ).toBe(true);
      expect(
        forTesting.isMaApiPropertyConfigMatch(
          voorziening2,
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
      const voorziening = {
        type: 'example',
        status: 'active',
        date: new Date('2023-01-01'),
      };

      const actionConfig: JzdApiConfig<typeof voorziening> = {
        include: {
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
      } as JzdApiConfig<ZorgnedAanvraagTransformed>;

      const result = forTesting.addMaApiPropsToVoorziening(
        [apiPropsConfig],
        voorziening
      );

      expect(result).toEqual({
        ...voorziening,
        maActies: ['reparatieverzoek'],
        maProductgroep: 'WRA',
      });
    });

    it('should include / exclude voorzieningen based on multiple configs and their include and exclude matchers', () => {
      const voorziening = {
        type: 'example',
        status: 'active',
      } as unknown as ZorgnedAanvraagTransformed;
      const voorziening2 = {
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
      } as JzdApiConfig<ZorgnedAanvraagTransformed>;

      const voorzieningTransformed1 = forTesting.addMaApiPropsToVoorziening(
        [apiPropsConfig],
        voorziening
      );

      expect(voorzieningTransformed1).toHaveProperty('maActies', [
        'assign-foo-bar',
      ]);

      const voorzieningTransformed2 = forTesting.addMaApiPropsToVoorziening(
        [apiPropsConfig],
        voorziening2
      );

      expect(voorzieningTransformed2).not.toHaveProperty('maActies');
    });

    it('should merge and deduplicate array properties if they already exist', () => {
      const voorziening = {
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
      } as JzdApiConfig<ZorgnedAanvraagTransformed>;

      const apiPropsConfig2 = {
        include: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: ['stopzetten'],
        },
      } as JzdApiConfig<ZorgnedAanvraagTransformed>;

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
      } as unknown as ZorgnedAanvraagTransformed;

      const apiPropsConfig: JzdApiConfig<typeof voorziening> = {
        include: {
          type: 'differentExample',
          status: 'inactive',
        },
        assign: {
          maActies: ['reparatieverzoek'],
        },
      } as JzdApiConfig<ZorgnedAanvraagTransformed>;

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
      } as unknown as ZorgnedAanvraagTransformed;

      const apiPropsConfig: JzdApiConfig<typeof voorziening> = {
        include: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: undefined,
          maProductgroep: undefined,
        },
      } as JzdApiConfig<ZorgnedAanvraagTransformed>;

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
      } as unknown as ZorgnedAanvraagTransformed;

      const apiPropsConfig1 = {
        include: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: ['stopzetten'],
        },
      } as JzdApiConfig<ZorgnedAanvraagTransformed>;

      const apiPropsConfig2 = {
        include: {
          type: 'example',
          status: 'active',
        },
        assign: {
          maActies: ['reparatieverzoek'],
        },
      } as JzdApiConfig<ZorgnedAanvraagTransformed>;

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

  describe('fetch voorzieningen', () => {
    function getAanvraag(
      productsoortCode: string = 'WRA',
      leveringsvorm: string = 'ZIN',
      identificatie: string | null = null,
      datumEindeGeldigheid: string | null = null
    ) {
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
                identificatie,
              },
              resultaat: 'toegewezen',
              toegewezenProduct: {
                datumIngangGeldigheid: '2023-05-06',
                datumEindeGeldigheid,
                leveringsvorm,
                leverancier: {
                  identificatie: 'LA0994',
                  omschrijving: 'Gebr Koenen B.V.',
                },
                actueel: true,
                toewijzingen: [
                  {
                    leveringen: [
                      {
                        begindatum: '2023-05-06',
                        einddatum: null,
                      },
                    ],
                  },
                ],
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

    describe('fetchMaApiVoorzieningen', () => {
      test('should fetch voorzieningen and add MA API props based on config', async () => {
        remoteApi.post('/zorgned/aanvragen').reply(200);
        remoteApi
          .post('/zorgned/aanvragen')
          .reply(
            200,
            getZorgnedAanvragenResponse([
              getAanvraag('LLV', 'ZIN', 'LLVAVG', null),
            ])
          );

        const response = await fetchMaApiVoorzieningen('123456789', undefined, [
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
        ]);

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

      test('Does not apply assignments to voorzieningen that do not match the isActueel flag', async () => {
        remoteApi
          .post('/zorgned/aanvragen')
          .reply(
            200,
            getZorgnedAanvragenResponse([
              getAanvraag('WRA', 'ZIN', null, '2023-01-01'),
            ])
          );
        remoteApi.post('/zorgned/aanvragen').reply(200);

        const response = await fetchMaApiVoorzieningen('123456789', undefined, [
          {
            include: {
              leveringsVorm: 'ZIN',
              isActueel: true,
              productsoortCode: ['WRA'],
            },
            assign: {
              maActies: ['reparatieverzoek'],
              maProductgroep: 'een-naam',
            },
          },
        ]);

        expect(response.content?.[0]).not.toMatchObject({
          maActies: ['reparatieverzoek'],
          maProductgroep: 'een-naam',
        });
      });

      test('should filter voorzieningen based on options', async () => {
        remoteApi
          .post('/zorgned/aanvragen')
          .reply(
            200,
            getZorgnedAanvragenResponse([getAanvraag(), getAanvraag('ABC')])
          );
        remoteApi.post('/zorgned/aanvragen').reply(200);

        const response = await fetchMaApiVoorzieningen(
          '123456789',
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

      test('should return empty array if no voorzieningen match the filters', async () => {
        remoteApi
          .post('/zorgned/aanvragen')
          .reply(
            200,
            getZorgnedAanvragenResponse([getAanvraag(), getAanvraag('ABC')])
          );
        remoteApi.post('/zorgned/aanvragen').reply(200);

        const response = await fetchMaApiVoorzieningen(
          '123456789',
          {
            maActies: ['non-existing-action'] as unknown as [
              'reparatieverzoek',
            ],
            maProductgroep: ['non-existing-productgroep'] as unknown as ['WRA'],
          },
          [
            {
              include: {
                leveringsVorm: 'ZIN',
              },
              assign: {
                maActies: ['reparatieverzoek'],
                maProductgroep: 'een-naam',
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

    describe('fetchMaApiVoorzieningById', () => {
      test('should fetch a single voorziening by ID and add MA API props based on config', async () => {
        const aanvraag = getAanvraag();
        remoteApi
          .post('/zorgned/aanvragen')
          .reply(200, getZorgnedAanvragenResponse([aanvraag]));
        remoteApi.post('/zorgned/aanvragen').reply(200);

        const response = await forTesting.fetchMaApiVoorzieningById(
          '123456789',
          '300111429-116841'
        );

        expect(response.content).toMatchObject({
          maActies: ['reparatieverzoek', 'stopzetten'],
          maProductgroep: 'WRA',
          leverancier: 'Gebr Koenen B.V.',
          leverancierIdentificatie: 'LA0994',
          leveringsVorm: 'ZIN',
          productsoortCode: 'WRA',
        });
      });

      test('should return an error if the voorziening with the specified ID is not found', async () => {
        const aanvraag = getAanvraag();
        remoteApi
          .post('/zorgned/aanvragen')
          .reply(200, getZorgnedAanvragenResponse([aanvraag]));
        remoteApi.post('/zorgned/aanvragen').reply(200);

        const response = await forTesting.fetchMaApiVoorzieningById(
          '123456789',
          'non-existing-id'
        );

        expect(response.status).toBe('ERROR');
        expect(response.status === 'ERROR' && response.message).toBe(
          'No voorziening found with id non-existing-id'
        );
        expect(response.status === 'ERROR' && response.code).toBe(404);
      });
    });
  });
});
