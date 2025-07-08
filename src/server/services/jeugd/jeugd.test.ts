import { Mock } from 'vitest';

import { fetchLeerlingenvervoer } from './jeugd.ts';
import { getAuthProfileAndToken } from '../../../testing/utils.ts';
import { apiErrorResult } from '../../../universal/helpers/api.ts';
import { fetchAanvragen } from '../zorgned/zorgned-service.ts';

const REQUEST_ID = '1';
const AUTH_PROFILE_AND_TOKEN = getAuthProfileAndToken();
const VOORZIENING_ID = '1610585298';

vi.mock('../zorgned/zorgned-service', async (importOriginal) => ({
  ...(await importOriginal()),
  fetchAanvragen: vi.fn(),
}));

vi.mock('../../../server/helpers/encrypt-decrypt', async (importOriginal) => ({
  ...(await importOriginal()),
  encryptSessionIdWithRouteIdParam: vi.fn().mockReturnValue('encrypted-value'),
}));

test('Succes Response is formatted correctly', async () => {
  (fetchAanvragen as Mock).mockResolvedValueOnce({
    content: [
      {
        id: VOORZIENING_ID,
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
        productIdentificatie: 'LLVAVG',
        resultaat: 'toegewezen',
        titel: 'aangepast groepsvervoer',
        betrokkenen: ['999990779'],
      },
      {
        id: '2735835706',
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
        productIdentificatie: 'LLVOVA',
        resultaat: 'toegewezen',
        titel: 'openbaar vervoer abonnement',
        betrokkenen: ['343007101'],
      },
      {
        id: '1804759541',
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
        productIdentificatie: 'LLVEV',
        resultaat: 'toegewezen',
        titel: 'eigen vervoer',
        betrokkenen: [],
      },
      {
        id: '232024340',
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
        productIdentificatie: 'LLVAVG',
        resultaat: 'toegewezen',
        titel: 'aangepast groepsvervoer',
        betrokkenen: [],
      },
    ],
    status: 'OK',
  });

  const response = await fetchLeerlingenvervoer(AUTH_PROFILE_AND_TOKEN);
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
        url: 'http://bff-api-host/api/v1/services/llv/document/encrypted-value',
      },
    ],
    id: '1610585298',
    isActual: true,
    itemTypeCode: 'LLV',
    link: {
      title: 'Meer informatie',
      to: '/jeugd/voorziening/1610585298',
    },
    displayStatus: 'Besluit genomen',
    statusDate: '2025-04-07T09:44:48.697',
    statusDateFormatted: '07 april 2025',
    steps: [
      {
        datePublished: '',
        documents: [],
        id: 'status-step-0',
        isActive: false,
        isChecked: true,
        isVisible: true,
        status: 'Aanvraag ontvangen',
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
        id: 'status-step-3',
        isActive: true,
        isChecked: true,
        isVisible: true,
        status: 'Besluit genomen',
      },
      {
        datePublished: '',
        documents: [],
        id: 'status-step-4',
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
  expect(descriptions[0]).toMatch(/Uw aanvraag is ontvangen/);
  expect(descriptions[1]).toMatch(/Uw aanvraag is in behandeling/);
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

test('Returns error response "as is" from fetchAanvragen', async () => {
  (fetchAanvragen as Mock).mockResolvedValueOnce(apiErrorResult('', null, 404));
  const response = await fetchLeerlingenvervoer(AUTH_PROFILE_AND_TOKEN);
  expect(response).toStrictEqual({
    code: 404,
    content: null,
    message: '',
    status: 'ERROR',
  });
});
