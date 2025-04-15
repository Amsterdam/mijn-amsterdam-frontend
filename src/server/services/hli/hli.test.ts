import MockDate from 'mockdate';
import { Mock } from 'vitest';

import { forTesting } from './hli';
import { fetchZorgnedAanvragenHLI } from './hli-zorgned-service';
import { getAuthProfileAndToken } from '../../../testing/utils';
import {
  apiSuccessResult,
  apiErrorResult,
} from '../../../universal/helpers/api';
import { GenericDocument, StatusLineItem } from '../../../universal/types';
import { ZorgnedAanvraagWithRelatedPersonsTransformed } from '../zorgned/zorgned-types';

vi.mock('./hli-zorgned-service', () => ({
  fetchZorgnedAanvragenHLI: vi.fn(),
}));

vi.mock('./stadspas', () => ({
  fetchStadspas: vi.fn(),
}));

vi.mock('../../helpers/encrypt-decrypt', async (requireActual) => {
  return {
    ...((await requireActual()) as object),
    encryptSessionIdWithRouteIdParam: () => {
      return 'test-encrypted-id';
    },
  };
});

describe('HLI', () => {
  test('getDisplayStatus', () => {
    const regeling1 = {
      productIdentificatie: 'AV-UPCC',
      datumEindeGeldigheid: '2024-08-29',
      datumIngangGeldigheid: '2024-08-29',
      resultaat: 'toegewezen',
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    const statusLineItems1 = [] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling1, statusLineItems1)).toBe(
      'Afgewezen'
    );

    const regeling2 = {
      resultaat: 'toegewezen',
      isActueel: false,
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    const statusLineItems2 = [{ status: 'Einde recht' }] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling2, statusLineItems2)).toBe(
      'Einde recht'
    );

    const regeling3 = {
      resultaat: 'toegewezen',
      isActueel: false,
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    const statusLineItems3 = [] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling3, statusLineItems3)).toBe(
      'Toegewezen'
    );

    const regeling4 = {
      resultaat: 'afgewezen',
      isActueel: true,
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    const statusLineItems4 = [] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling4, statusLineItems4)).toBe(
      'Onbekend'
    );

    const regeling5 = {
      resultaat: 'afgewezen',
      isActueel: true,
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    const statusLineItems5 = [{ status: 'Foo Bar' }] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling5, statusLineItems5)).toBe(
      'Foo Bar'
    );

    const regeling6 = {
      isActueel: false,
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    const statusLineItems6 = [] as StatusLineItem[];

    expect(forTesting.getDisplayStatus(regeling6, statusLineItems6)).toBe(
      'Afgewezen'
    );

    const regeling7 = {
      productIdentificatie: 'AV-UPCC',
      datumEindeGeldigheid: '2024-08-29',
      datumIngangGeldigheid: '2024-08-29',
      resultaat: 'toegewezen',
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    expect(forTesting.getDisplayStatus(regeling7, [])).toBe('Afgewezen');

    const regeling8 = {
      productIdentificatie: 'AV-FOOBAR',
      datumEindeGeldigheid: '2024-08-29',
      datumIngangGeldigheid: '2024-08-29',
      resultaat: 'toegewezen',
    } as ZorgnedAanvraagWithRelatedPersonsTransformed;

    expect(forTesting.getDisplayStatus(regeling8, [])).toBe('Toegewezen');
  });

  test('fetchRegelingen', async () => {
    const requestID = 'test-request-id';
    const authProfileAndToken = getAuthProfileAndToken('private');

    (fetchZorgnedAanvragenHLI as unknown as Mock).mockResolvedValue(
      apiSuccessResult([])
    );

    const result = await forTesting.fetchRegelingen(
      requestID,
      authProfileAndToken
    );
    expect(result.status).toBe('OK');
    expect(result.content).toEqual([]);

    (fetchZorgnedAanvragenHLI as unknown as Mock).mockResolvedValue(
      apiErrorResult('Error fetching aanvragen', null)
    );

    const resultError = await forTesting.fetchRegelingen(
      requestID,
      authProfileAndToken
    );
    expect(resultError.status).toBe('ERROR');
  });

  test('getDocumentsFrontend', () => {
    const sessionID = 'test-session-id';
    const documents: GenericDocument[] = [
      {
        id: 'doc1',
        title: 'Document 1',
        url: 'doc-url-1',
        datePublished: '2024-11-26',
      },
      {
        id: 'doc2',
        title: 'Document 2',
        url: 'doc-url-2',
        datePublished: '2024-09-26',
      },
    ];

    const result = forTesting.getDocumentsFrontend(sessionID, documents);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('test-encrypted-id');
    expect(result[0].url).toContain(
      'http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document/test-encrypted-id'
    );
  });

  test('transformRegelingForFrontend', async () => {
    const sessionID = 'test-session-id';
    const aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed = {
      id: 'aanvraag1',
      titel: 'Test Aanvraag',
      isActueel: true,
      datumBesluit: '2023-01-01',
      datumIngangGeldigheid: '2023-01-01',
      datumEindeGeldigheid: '2023-12-31',
      resultaat: 'toegewezen',
      documenten: [],
      betrokkenPersonen: [
        {
          name: 'Person 1',
          bsn: '',
          dateOfBirth: null,
          dateOfBirthFormatted: null,
        },
      ],
      betrokkenen: [],
      datumAanvraag: '',
      datumBeginLevering: null,
      datumEindeLevering: null,
      datumOpdrachtLevering: null,
      datumToewijzing: null,
      leverancier: '',
      leveringsVorm: '',
      productsoortCode: '',
    };

    const statusLineItems: StatusLineItem[] = [
      {
        status: 'Toegewezen',
        id: '',
        datePublished: '',
        isActive: false,
        isChecked: false,
      },
    ];

    const result = await forTesting.transformRegelingForFrontend(
      sessionID,
      aanvraag,
      statusLineItems
    );
    expect(result.id).toBe('aanvraag1');
    expect(result.title).toBe('Test Aanvraag');
    expect(result.displayStatus).toBe('Toegewezen');
  });

  describe('transformRegelingenForFrontend', async () => {
    const authProfileAndToken = getAuthProfileAndToken('private');
    const aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[] = [
      {
        id: 'aanvraag1',
        titel: 'Test Aanvraag',
        isActueel: true,
        datumBesluit: '2023-01-01',
        datumIngangGeldigheid: '2023-01-01',
        datumEindeGeldigheid: '2023-12-31',
        resultaat: 'toegewezen',
        documenten: [],
        betrokkenPersonen: [
          {
            name: 'Person 1',
            bsn: '',
            dateOfBirth: null,
            dateOfBirthFormatted: null,
          },
        ],
        betrokkenen: [],
        datumAanvraag: '',
        datumBeginLevering: null,
        datumEindeLevering: null,
        datumOpdrachtLevering: null,
        datumToewijzing: null,
        leverancier: '',
        leveringsVorm: '',
        productsoortCode: '',
        productIdentificatie: 'AV-UPCC',
      },
    ];
    const today = new Date();
    test('With productIdentificatie', async () => {
      const result = await forTesting.transformRegelingenForFrontend(
        authProfileAndToken,
        aanvragen,
        today
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('aanvraag1');
      expect(result[0].title).toBe('Test Aanvraag');
    });

    test('Without productIdentificatie', async () => {
      const aanvragen2 = [{ ...aanvragen[0], productIdentificatie: '' }];
      const result = await forTesting.transformRegelingenForFrontend(
        authProfileAndToken,
        aanvragen2,
        today
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('transformRegelingTitle', () => {
    beforeAll(() => {
      MockDate.set('2025-01-01');
    });

    afterAll(() => {
      MockDate.reset();
    });

    it('should return the title with "Stadspas" and the year range if the title contains "stadspas" and a valid start date', () => {
      const aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed = {
        titel: 'stadspas regeling',
        datumIngangGeldigheid: '2025-08-01',
        datumEindeGeldigheid: '2026-07-31',
        betrokkenPersonen: [],
        documenten: [],
        resultaat: 'toegewezen',
        isActueel: true,
        id: '1',
      };

      const result = forTesting.transformRegelingTitle(aanvraag);
      expect(result).toBe('Stadspas 2025-2026 (vanaf 01 augustus 2025)');
    });

    it('should return the title with "Stadspas" and the year range without "vanaf" if the start date is in the past', () => {
      const aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed = {
        titel: 'stadspas regeling',
        datumIngangGeldigheid: '2023-01-01',
        datumEindeGeldigheid: '2024-01-01',
        betrokkenPersonen: [],
        documenten: [],
        resultaat: 'toegewezen',
        isActueel: true,
        id: '2',
      };

      const result = forTesting.transformRegelingTitle(aanvraag);
      expect(result).toBe('Stadspas 2023-2024');
    });

    it('should capitalize the first letter of the title if it does not contain "stadspas"', () => {
      const aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed = {
        titel: 'regeling zonder de pas',
        datumIngangGeldigheid: null,
        datumEindeGeldigheid: null,
        betrokkenPersonen: [],
        documenten: [],
        resultaat: 'toegewezen',
        isActueel: true,
        id: '3',
      };

      const result = forTesting.transformRegelingTitle(aanvraag);
      expect(result).toBe('Regeling zonder de pas');
    });

    it('should return the title with "Stadspas" and no year range if no start date is provided', () => {
      const aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed = {
        titel: 'stadspas regeling',
        datumIngangGeldigheid: null,
        datumEindeGeldigheid: null,
        betrokkenPersonen: [],
        documenten: [],
        resultaat: 'toegewezen',
        isActueel: true,
        id: '4',
      };

      const result = forTesting.transformRegelingTitle(aanvraag);
      expect(result).toBe('Stadspas');
    });

    it('should return the title with "Stadspas" and no year range if start date is provided but result is afgewezen', () => {
      const aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed = {
        titel: 'stadspas regeling',
        datumIngangGeldigheid: '2023-01-01',
        datumEindeGeldigheid: '2024-01-01',
        betrokkenPersonen: [],
        documenten: [],
        resultaat: 'afgewezen',
        isActueel: true,
        id: '4',
      };

      const result = forTesting.transformRegelingTitle(aanvraag);
      expect(result).toBe('Stadspas 2023-2024');
    });
  });
});
