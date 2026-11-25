import Mockdate from 'mockdate';
import type { Mock } from 'vitest';

import { getAuthProfileAndToken } from '../../../../testing/utils.ts';
import { apiErrorResult } from '../../../../universal/helpers/api.ts';
import { fetchAanvragen } from '../../zorgned/zorgned-service.ts';
import type { ZorgnedAanvraagTransformed } from '../../zorgned/zorgned-types.ts';
import { fetchLeerlingenvervoer } from './jeugd.ts';

const AUTH_PROFILE_AND_TOKEN = getAuthProfileAndToken();
const VOORZIENING_ID = '1610585298';
const LLV_REQUEST_DOCUMENT = {
  id: 'request-document',
  title: 'Verzoek: extra info voor beoordelen aanvraag LLV',
  url: '',
  datePublished: '2026-11-17T15:42:28.04',
};
const LLV_DECISION_DOCUMENT = {
  id: 'decision-document',
  title: 'Besluit: toekenning Leerlingenvervoer (EV)',
  url: '',
  datePublished: '2026-11-17T15:56:30.263',
};
const LLV_ACTION_DESCRIPTIONS = [
  'Melding ontvangen',
  'Verzoek om meer informatie',
  'In behandeling bij gemeente',
];
const LLV_ACTIONS = [
  { omschrijving: 'Melding ontvangen', datum: '2026-11-17' },
  { omschrijving: 'Verzoek om meer informatie', datum: '2026-11-17' },
  { omschrijving: 'In behandeling bij gemeente', datum: '2026-11-17' },
];

function getLLVAanvraag(
  overrides: Partial<ZorgnedAanvraagTransformed> = {}
): ZorgnedAanvraagTransformed {
  return {
    betrokkenen: [],
    datumAanvraag: '2026-11-17',
    datumBeginLevering: null,
    datumBesluit: '',
    datumEindeGeldigheid: null,
    datumEindeLevering: null,
    datumIngangGeldigheid: null,
    datumOpdrachtLevering: null,
    datumToewijzing: null,
    procesAanvraagOmschrijving: 'Leerlingenvervoer',
    documenten: [],
    id: 'aanvraag-1',
    prettyID: 'aanvraag-1',
    procesIdentificatie: 'proces-1',
    procesMeldingIdentificatie: null,
    isActueel: false,
    leverancier: null,
    leverancierIdentificatie: null,
    leveringsVorm: '',
    leveringsVormUitgeschreven: null,
    productsoortCode: 'LLV',
    productIdentificatie: undefined,
    beschiktProductIdentificatie: null,
    beschikkingNummer: null,
    regelingIdentificatie: 'LLV',
    procesAanvraagActieOmschrijvingen: [],
    procesAanvraagActies: [],
    resultaat: null,
    titel: 'Ontvangen op 17 november 2026',
    ...overrides,
  };
}

const ASSIGNED_PRODUCT_OVERRIDES: Partial<ZorgnedAanvraagTransformed> = {
  datumBesluit: '2026-11-17',
  datumEindeGeldigheid: '2026-11-30',
  datumIngangGeldigheid: '2026-11-01',
  isActueel: true,
  beschiktProductIdentificatie: 'product-1',
  beschikkingNummer: 1,
  productIdentificatie: 'LLVEV',
  resultaat: 'toegewezen',
  titel: 'eigen vervoer',
};

const LLV_STATUS_SCENARIOS = [
  {
    scenario: 'In behandeling na ontvangst',
    aanvraag: getLLVAanvraag({
      documenten: [LLV_REQUEST_DOCUMENT],
      procesAanvraagActieOmschrijvingen: LLV_ACTION_DESCRIPTIONS,
      procesAanvraagActies: LLV_ACTIONS,
    }),
    displayStatus: 'In behandeling',
    decision: '',
    decisionChecked: false,
    substepStatuses: ['Meer informatie nodig', 'Meer informatie ontvangen'],
  },
  {
    scenario: 'Aanvraag ontvangen',
    aanvraag: getLLVAanvraag({
      procesAanvraagActieOmschrijvingen: ['Melding ontvangen'],
      procesAanvraagActies: [LLV_ACTIONS[0]],
    }),
    displayStatus: 'In behandeling',
    decision: '',
    decisionChecked: false,
    substepStatuses: [],
  },
  {
    scenario: 'Toegewezen zonder besluitbrief',
    aanvraag: getLLVAanvraag({
      ...ASSIGNED_PRODUCT_OVERRIDES,
      documenten: [LLV_REQUEST_DOCUMENT],
      procesAanvraagActieOmschrijvingen: LLV_ACTION_DESCRIPTIONS,
      procesAanvraagActies: LLV_ACTIONS,
    }),
    displayStatus: 'In behandeling',
    decision: '',
    decisionChecked: false,
    substepStatuses: ['Meer informatie nodig', 'Meer informatie ontvangen'],
  },
  {
    scenario: 'Aanvullende stukken gevraagd',
    aanvraag: getLLVAanvraag({
      documenten: [LLV_REQUEST_DOCUMENT],
      procesAanvraagActieOmschrijvingen: [
        'Melding ontvangen',
        'Verzoek om meer informatie',
      ],
      procesAanvraagActies: LLV_ACTIONS.slice(0, 2),
    }),
    displayStatus: 'Meer informatie nodig',
    decision: '',
    decisionChecked: false,
    substepStatuses: ['Meer informatie nodig'],
  },
  {
    scenario: 'Besluitdocument toegevoegd',
    aanvraag: getLLVAanvraag({
      ...ASSIGNED_PRODUCT_OVERRIDES,
      documenten: [LLV_REQUEST_DOCUMENT, LLV_DECISION_DOCUMENT],
      procesAanvraagActieOmschrijvingen: LLV_ACTION_DESCRIPTIONS,
      procesAanvraagActies: LLV_ACTIONS,
    }),
    displayStatus: 'Besluit genomen',
    decision: 'Toegewezen',
    decisionChecked: true,
    substepStatuses: ['Meer informatie nodig', 'Meer informatie ontvangen'],
  },
];

vi.mock('../../zorgned/zorgned-service', async (importOriginal) => ({
  ...(await importOriginal()),
  fetchAanvragen: vi.fn(),
}));

vi.mock(
  '../../../../server/helpers/encrypt-decrypt',
  async (importOriginal) => ({
    ...(await importOriginal()),
    encryptSessionIdWithRouteIdParam: vi
      .fn()
      .mockReturnValue('encrypted-value'),
  })
);

describe('fetchLeerlingenvervoer', () => {
  beforeAll(() => {
    Mockdate.set(new Date('2025-04-08T12:00:00.000'));
  });

  afterAll(() => {
    Mockdate.reset();
  });

  test('Succes Response is formatted correctly', async () => {
    (fetchAanvragen as Mock).mockResolvedValueOnce({
      content: [
        {
          id: VOORZIENING_ID,
          prettyID: VOORZIENING_ID,
          datumAanvraag: '2025-03-27',
          datumBeginLevering: null,
          datumBesluit: '2025-03-27',
          datumEindeGeldigheid: '2026-04-01',
          datumEindeLevering: null,
          datumIngangGeldigheid: '2025-04-01',
          datumOpdrachtLevering: null,
          datumToewijzing: null,
          documenten: [
            {
              id: 'B3392456',
              title: 'Besluit: toekenning Leerlingenvervoer (AV)',
              url: '',
              datePublished: '2025-04-07T09:44:48.697',
            },
          ],
          isActueel: true,
          leverancier: 'Munckhof',
          leveringsVorm: '',
          productsoortCode: 'LLV',
          regelingIdentificatie: 'LLV',
          productIdentificatie: 'LLVAVG',
          resultaat: 'toegewezen',
          titel: 'aangepast groepsvervoer',
          betrokkenen: ['999990779'],
        },
        {
          id: '2735835706',
          prettyID: '2735835706',
          datumAanvraag: '2025-02-20',
          datumBeginLevering: null,
          datumBesluit: '2025-02-20',
          datumEindeGeldigheid: null,
          datumEindeLevering: null,
          datumIngangGeldigheid: '2025-04-01',
          datumOpdrachtLevering: null,
          datumToewijzing: null,
          documenten: [],
          isActueel: true,
          leverancier: '',
          leveringsVorm: '',
          productsoortCode: 'LLV',
          regelingIdentificatie: 'LLV',
          productIdentificatie: 'LLVOVA',
          resultaat: 'toegewezen',
          titel: 'openbaar vervoer abonnement',
          betrokkenen: ['343007101'],
        },
        {
          id: '1804759541',
          prettyID: '1804759541',
          datumAanvraag: '2020-06-12',
          datumBeginLevering: null,
          datumBesluit: '2020-09-11',
          datumEindeGeldigheid: '2025-03-31',
          datumEindeLevering: null,
          datumIngangGeldigheid: '2020-08-17',
          datumOpdrachtLevering: null,
          datumToewijzing: null,
          documenten: [],
          isActueel: false,
          leverancier: '',
          leveringsVorm: '',
          productsoortCode: 'LLV',
          regelingIdentificatie: 'LLV',
          productIdentificatie: 'LLVEV',
          resultaat: 'toegewezen',
          titel: 'eigen vervoer',
          betrokkenen: [],
        },
        {
          id: '232024340',
          prettyID: '232024340',
          datumAanvraag: '2019-07-12',
          datumBeginLevering: null,
          datumBesluit: '2019-07-12',
          datumEindeGeldigheid: '2020-07-03',
          datumEindeLevering: null,
          datumIngangGeldigheid: '2019-08-26',
          datumOpdrachtLevering: null,
          datumToewijzing: null,
          documenten: [],
          isActueel: false,
          leverancier: 'Alphons Laudy (so)',
          leveringsVorm: 'ZIN',
          productsoortCode: 'LLV',
          regelingIdentificatie: 'LLV',
          productIdentificatie: 'LLVAVG',
          resultaat: 'toegewezen',
          titel: 'aangepast groepsvervoer',
          betrokkenen: [],
        },
      ],
      status: 'OK',
    });

    const response = await fetchLeerlingenvervoer(AUTH_PROFILE_AND_TOKEN);
    expect(fetchAanvragen).toHaveBeenCalledWith(
      AUTH_PROFILE_AND_TOKEN.profile.id,
      {
        zorgnedApiConfigKey: 'ZORGNED_LEERLINGENVERVOER',
        includeAanvragenWithoutBeschiktProduct: true,
      }
    );
    const first = response.content![0];

    const expected = {
      dateDecision: '2025-04-07T09:44:48.697',
      dateDecisionFormatted: '07 april 2025',
      decision: 'Toegewezen',
      documents: [
        {
          datePublished: '2025-04-07T09:44:48.697',
          id: 'B3392456',
          title: 'Besluit: toekenning Leerlingenvervoer (AV)',
          url: 'http://bff-api-host/api/v1/services/llv/document?id=encrypted-value',
        },
      ],
      id: '1610585298',
      isActual: true,
      itemTypeCode: 'LLV',
      link: {
        title: 'Meer informatie',
        to: '/jeugd/voorziening/aangepast-groepsvervoer/1610585298',
      },
      displayStatus: 'Besluit genomen',
      statusDate: '2025-04-07T09:44:48.697',
      statusDateFormatted: '07 april 2025',
      steps: [
        {
          datePublished: '2025-03-27',
          documents: [],
          id: 'status-step-0',
          isActive: false,
          isChecked: true,
          isVisible: true,
          status: 'Ontvangen',
        },
        {
          datePublished: '2025-03-27',
          documents: [],
          id: 'status-step-1',
          isActive: false,
          isChecked: true,
          isVisible: true,
          status: 'In behandeling',
        },
        {
          datePublished: '2025-04-07T09:44:48.697',
          documents: [],
          id: 'status-step-2',
          isActive: true,
          isChecked: true,
          isVisible: true,
          status: 'Besluit genomen',
        },
        {
          datePublished: '',
          documents: [],
          id: 'status-step-3',
          isActive: false,
          isChecked: false,
          isVisible: true,
          status: 'Einde recht',
        },
      ],
      title: 'Aangepast groepsvervoer',
    };
    expect(first).toMatchObject(expected);

    const descriptions = first.steps.map((step) => step.description);
    expect(descriptions[0]).toMatch(/Ontvangen op 27 maart 2025/);
    expect(descriptions[1]).toMatch(/Uw melding is in behandeling./);
    expect(descriptions[2]).toMatch(
      /U krijgt aangepast groepsvervoer per 01 april 2025./
    );
    expect(descriptions[2]).toMatch(
      /In de brief leest u meer over dit besluit. De brief staat bovenaan deze pagina./
    );
    expect(descriptions[3]).toMatch(
      /Als uw recht op aangepast groepsvervoer stopt, krijgt u hiervan bericht./
    );
  });

  test('Keeps the treatment status active when more information is needed', async () => {
    (fetchAanvragen as Mock).mockResolvedValueOnce({
      content: [
        {
          id: '3695853',
          prettyID: '3695853',
          datumAanvraag: '2026-05-19',
          datumBeginLevering: null,
          datumBesluit: '',
          datumEindeGeldigheid: null,
          datumEindeLevering: null,
          datumIngangGeldigheid: null,
          datumOpdrachtLevering: null,
          datumToewijzing: null,
          documenten: [
            {
              id: 'B4092578',
              title: 'Verzoek: extra info voor beoordelen aanvraag LLV',
              url: '',
              datePublished: '2026-08-10T15:56:15.467',
            },
          ],
          isActueel: false,
          leverancier: '',
          leveringsVorm: '',
          productsoortCode: 'LLV',
          regelingIdentificatie: 'LLV',
          procesAanvraagActieOmschrijvingen: [
            'Melding ontvangen',
            'Verzoek om meer informatie',
            'In behandeling bij gemeente',
          ],
          resultaat: undefined,
          titel: 'Leerlingenvervoer',
          betrokkenen: [],
          procesAanvraagActies: [
            {
              omschrijving: 'Verzoek om meer informatie',
              datum: '2026-10-08',
            },
            {
              omschrijving: 'In behandeling bij gemeente',
              datum: '2026-08-10',
            },
          ],
        },
      ],
      status: 'OK',
    });

    const response = await fetchLeerlingenvervoer(AUTH_PROFILE_AND_TOKEN);
    const [voorziening] = response.content!;
    const [melding, behandeling] = voorziening.steps;

    expect(voorziening.link.to).toBe(
      '/jeugd/voorziening/in-behandeling/3695853'
    );
    expect(behandeling).toMatchObject({
      status: 'In behandeling',
      isActive: true,
      substeps: [
        {
          status: 'Meer informatie nodig',
          datePublished: '2026-10-08',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Meer informatie ontvangen',
          datePublished: '2026-08-10',
          isActive: false,
          isChecked: true,
        },
      ],
    });
    expect(melding.isActive).toBe(false);
    expect(melding.datePublished).toBe('2026-05-19');
    expect(behandeling.datePublished).toBe('2026-05-19');
    expect(voorziening.statusDate).toBe('2026-08-10');
    expect(voorziening.statusDateFormatted).toBe('10 augustus 2026');
  });

  test('Shows when submitted additional information is being processed', async () => {
    (fetchAanvragen as Mock).mockResolvedValueOnce({
      content: [
        {
          id: '3695853',
          prettyID: '3695853',
          datumAanvraag: '2026-05-19',
          datumBeginLevering: null,
          datumBesluit: '',
          datumEindeGeldigheid: null,
          datumEindeLevering: null,
          datumIngangGeldigheid: null,
          datumOpdrachtLevering: null,
          datumToewijzing: null,
          documenten: [
            {
              id: 'B4092578',
              title: 'Verzoek: extra info voor beoordelen aanvraag LLV',
              url: '',
              datePublished: '2026-08-10T15:56:15.467',
            },
          ],
          isActueel: false,
          leverancier: '',
          leveringsVorm: '',
          productsoortCode: null,
          regelingIdentificatie: 'LLV',
          procesAanvraagActieOmschrijvingen: [
            'Melding ontvangen',
            'Verzoek om meer informatie',
            'In behandeling bij gemeente',
            'In behandeling bij gemeente',
          ],
          resultaat: null,
          titel: 'Leerlingenvervoer',
          betrokkenen: [],
          procesAanvraagActies: [
            {
              omschrijving: 'In behandeling bij gemeente',
              datum: '2026-08-10',
            },
            {
              omschrijving: 'In behandeling bij gemeente',
              datum: '2026-08-12',
            },
          ],
        },
      ],
      status: 'OK',
    });

    const response = await fetchLeerlingenvervoer(AUTH_PROFILE_AND_TOKEN);
    const [, behandeling] = response.content![0].steps;

    expect(behandeling).toMatchObject({
      status: 'In behandeling',
      datePublished: '2026-05-19',
      isActive: true,
      substeps: [
        {
          status: 'Meer informatie nodig',
          datePublished: '',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Meer informatie ontvangen',
          datePublished: '2026-08-10',
          isActive: false,
          isChecked: true,
        },
      ],
    });
  });

  test('Shows only one "Meer informatie nodig" step when multiple request documents exist', async () => {
    (fetchAanvragen as Mock).mockResolvedValueOnce({
      content: [
        {
          id: '3695853',
          prettyID: '3695853',
          datumAanvraag: '2026-05-19',
          datumBeginLevering: null,
          datumBesluit: '',
          datumEindeGeldigheid: null,
          datumEindeLevering: null,
          datumIngangGeldigheid: null,
          datumOpdrachtLevering: null,
          datumToewijzing: null,
          documenten: [
            {
              id: 'B4092578',
              title: 'Verzoek: extra info voor beoordelen aanvraag LLV',
              url: '',
              datePublished: '2026-08-10T15:56:15.467',
            },
            {
              id: 'B4092599',
              title: 'Verzoek: aanvullende informatie voor aanvraag LLV',
              url: '',
              datePublished: '2026-09-10T15:56:15.467',
            },
          ],
          isActueel: false,
          leverancier: '',
          leveringsVorm: '',
          productsoortCode: 'LLV',
          regelingIdentificatie: 'LLV',
          procesAanvraagActieOmschrijvingen: [
            'Verzoek om meer informatie',
            'In behandeling bij gemeente',
          ],
          resultaat: null,
          titel: 'Leerlingenvervoer',
          betrokkenen: [],
          procesAanvraagActies: [
            {
              omschrijving: 'Verzoek om meer informatie',
              datum: '2026-07-10',
            },
            {
              omschrijving: 'In behandeling bij gemeente',
              datum: '2026-08-10',
            },
          ],
        },
      ],
      status: 'OK',
    });

    const response = await fetchLeerlingenvervoer(AUTH_PROFILE_AND_TOKEN);
    const [, behandeling] = response.content![0].steps;

    expect(
      behandeling.substeps?.filter(
        (step) => step.status === 'Meer informatie nodig'
      )
    ).toHaveLength(1);
  });

  test.each(LLV_STATUS_SCENARIOS)(
    '$scenario',
    async ({
      aanvraag,
      displayStatus,
      decision,
      decisionChecked,
      substepStatuses,
    }) => {
      (fetchAanvragen as Mock).mockResolvedValueOnce({
        content: [aanvraag],
        status: 'OK',
      });

      const response = await fetchLeerlingenvervoer(AUTH_PROFILE_AND_TOKEN);
      const [voorziening] = response.content!;
      const behandeling = voorziening.steps.find(
        (step) => step.status === 'In behandeling'
      );
      const besluit = voorziening.steps.find(
        (step) => step.status === 'Besluit genomen'
      );

      expect(voorziening.displayStatus).toBe(displayStatus);
      expect(voorziening.decision).toBe(decision);
      expect(besluit?.isChecked).toBe(decisionChecked);
      expect(behandeling?.substeps?.map((step) => step.status) ?? []).toEqual(
        substepStatuses
      );
    }
  );

  test('Returns error response "as is" from fetchAanvragen', async () => {
    (fetchAanvragen as Mock).mockResolvedValueOnce(
      apiErrorResult('', null, 404)
    );
    const response = await fetchLeerlingenvervoer(AUTH_PROFILE_AND_TOKEN);
    expect(response).toStrictEqual({
      code: 404,
      content: null,
      message: '',
      status: 'ERROR',
    });
  });
});
