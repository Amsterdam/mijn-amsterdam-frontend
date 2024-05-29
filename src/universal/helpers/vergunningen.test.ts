import { CaseType } from '../types/vergunningen';
import {
  hasOtherActualVergunningOfSameType,
  hasWorkflow,
  isExpired,
  isNearEndDate,
  showDocuments,
} from './vergunningen';

describe('helpers/Vergunningen', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2022-10-06'));

  test('isNearEndDate', () => {
    {
      // No end date
      const vergunning: any = {
        dateEnd: null,
      };
      expect(isNearEndDate(vergunning.dateEnd)).toBe(false);
    }
    {
      // Near end
      const vergunning: any = {
        dateEnd: '2022-10-28',
      };
      expect(isNearEndDate(vergunning.dateEnd)).toBe(true);
    }
    {
      // Not near end
      const vergunning: any = {
        dateEnd: '2023-10-28',
      };
      expect(isNearEndDate(vergunning.dateEnd)).toBe(false);
    }
  });

  test('isExpired', () => {
    {
      // Not expired
      const vergunning: any = {
        dateEnd: '2023-10-28',
      };
      expect(isExpired(vergunning)).toBe(false);
    }
    {
      const vergunning: any = {
        dateEnd: '2022-10-07',
      };
      expect(isExpired(vergunning)).toBe(false);
    }
    {
      // Is expired
      const vergunning: any = {
        dateEnd: '2022-10-06',
      };
      expect(isExpired(vergunning)).toBe(true);
    }
    {
      const vergunning: any = {
        dateEnd: '2022-10-06',
      };
      expect(isExpired(vergunning)).toBe(true);
    }
    {
      const vergunning: any = {
        dateEnd: '2022-09-28',
      };
      expect(isExpired(vergunning)).toBe(true);
    }
  });

  test('hasOtherActualVergunningOfSameType', () => {
    const vergunning: any = {
      caseType: 'test1',
      dateEnd: null,
      identifier: 'xx1',
    };

    {
      const vergunningen: any = [
        { caseType: 'test1', dateEnd: null, identifier: 'xx2' },
        vergunning,
      ];

      expect(hasOtherActualVergunningOfSameType(vergunningen, vergunning)).toBe(
        true
      );
    }

    {
      const vergunningen: any = [vergunning];

      expect(hasOtherActualVergunningOfSameType(vergunningen, vergunning)).toBe(
        false
      );
    }

    {
      const vergunningen: any = [
        { caseType: 'test1', dateEnd: '2022-05-06', identifier: 'xx2' },
        vergunning,
      ];

      expect(hasOtherActualVergunningOfSameType(vergunningen, vergunning)).toBe(
        false
      );
    }
  });

  test('hasWorkflow', () => {
    expect(hasWorkflow(CaseType.Omzettingsvergunning)).toBe(true);
    expect(hasWorkflow(CaseType.TVMRVVObject)).toBe(false);
    expect(hasWorkflow(CaseType.BZP)).toBe(false);
  });

  test('showDocuments', () => {
    expect(showDocuments(CaseType.Omzettingsvergunning)).toBe(false);
    expect(showDocuments(CaseType.TVMRVVObject)).toBe(true);
    expect(showDocuments(CaseType.BZP)).toBe(true);
    expect(showDocuments(CaseType.BZB)).toBe(true);
  });
});
