import MockDate from 'mockdate';
import { describe, expect, it } from 'vitest';

import { VarenVergunningExploitatieType } from './config-and-types.ts';
import { getStatusSteps } from './varen-status-steps.ts';

const exploitatieBase = {
  vesselName: 'boatName',
  processed: false,
  statusDates: [],
  dateRequest: '2025-01-01T00:00:00',
} as unknown as VarenVergunningExploitatieType;

describe('getStatusSteps', () => {
  const MOCK_CURRENT_DATE = '2025-01-20';
  MockDate.set(MOCK_CURRENT_DATE);

  it('exploitatieInProgress', () => {
    const exploitatieInProgress = {
      ...exploitatieBase,
      termijnDates: [],
    } as unknown as VarenVergunningExploitatieType;

    expect(getStatusSteps(exploitatieInProgress)).toStrictEqual([
      {
        datePublished: exploitatieInProgress.dateRequest,
        description: '',
        id: 'step-0',
        isActive: false,
        isChecked: true,
        status: 'Ontvangen',
      },
      {
        datePublished: exploitatieInProgress.dateRequest,
        description: '',
        id: 'step-1',
        isActive: true,
        isChecked: false,
        status: 'In behandeling',
      },
      {
        datePublished: '',
        id: 'step-2',
        isActive: false,
        isChecked: false,
        status: 'Afgehandeld',
      },
    ]);
  });

  it('exploitatieMeerInformatie', () => {
    const termijn1 = {
      status: 'Meer informatie nodig',
      dateStart: '2025-01-02T00:00:00',
      dateEnd: '2025-01-16T00:00:00',
    };
    const termijn2 = {
      status: 'Meer informatie nodig',
      dateStart: '2025-01-17T00:00:00',
      dateEnd: '2025-01-30T00:00:00',
    };
    const exploitatieMeerInformatieWithin = {
      ...exploitatieBase,
      termijnDates: [termijn1, termijn2],
    } as unknown as VarenVergunningExploitatieType;

    expect(getStatusSteps(exploitatieMeerInformatieWithin)).toMatchObject([
      {
        datePublished: exploitatieMeerInformatieWithin.dateRequest,
        isActive: false,
        isChecked: true,
        status: 'Ontvangen',
      },
      {
        datePublished: exploitatieMeerInformatieWithin.dateRequest,
        isActive: false,
        isChecked: true,
        status: 'In behandeling',
      },
      {
        actionButtonItems: [],
        datePublished: termijn1.dateStart,
        isActive: false,
        isChecked: true,
        status: 'Meer informatie nodig',
      },
      {
        datePublished: termijn1.dateEnd,
        isActive: false,
        isChecked: true,
        status: 'In behandeling',
      },
      {
        actionButtonItems: [],
        datePublished: termijn2.dateStart,
        description:
          'Er is meer informatie nodig om uw aanvraag verder te kunnen verwerken. Lever deze informatie aan voor 30 januari 2025',
        isActive: true,
        isChecked: false,
        status: 'Meer informatie nodig',
      },
      {
        datePublished: '',
        isActive: false,
        isChecked: false,
        status: 'Afgehandeld',
      },
    ]);
  });

  it('exploitatieMeerInformatie in behandeling', () => {
    const termijn = {
      status: 'Meer informatie nodig',
      dateStart: '2025-01-02T00:00:00',
      dateEnd: '2025-01-16T00:00:00',
    };
    const exploitatieMeerInformatieAfter = {
      ...exploitatieBase,
      termijnDates: [termijn],
    } as unknown as VarenVergunningExploitatieType;

    expect(getStatusSteps(exploitatieMeerInformatieAfter)).toMatchObject([
      {},
      {},
      {
        actionButtonItems: [],
        datePublished: termijn.dateStart,
        isActive: false,
        isChecked: true,
        status: 'Meer informatie nodig',
      },
      {
        datePublished: termijn.dateEnd,
        isActive: true,
        isChecked: false,
        status: 'In behandeling',
      },
      {
        datePublished: '',
        isActive: false,
        isChecked: false,
        status: 'Afgehandeld',
      },
    ]);
  });

  it('exploitatieMeerInformatie has termijn overlap', () => {
    const termijn1 = {
      status: 'Meer informatie nodig',
      dateStart: '2025-01-02T00:00:00',
      dateEnd: '2025-01-16T00:00:00',
    };
    const termijn2 = {
      status: 'Meer informatie nodig',
      dateStart: '2025-01-10T00:00:00',
      dateEnd: '2025-01-24T00:00:00',
    };
    const exploitatieMeerInformatieOverlap = {
      ...exploitatieBase,
      termijnDates: [termijn1, termijn2],
    } as unknown as VarenVergunningExploitatieType;

    expect(getStatusSteps(exploitatieMeerInformatieOverlap)).toMatchObject([
      {},
      {},
      {
        actionButtonItems: [],
        datePublished: termijn1.dateStart,
        isActive: false,
        isChecked: true,
        status: 'Meer informatie nodig',
      },
      {
        datePublished: termijn2.dateStart,
        isActive: false,
        isChecked: true,
        status: 'In behandeling',
      },
      {
        actionButtonItems: [],
        datePublished: termijn2.dateStart,
        description:
          'Er is meer informatie nodig om uw aanvraag verder te kunnen verwerken. Lever deze informatie aan voor 24 januari 2025',
        isActive: true,
        isChecked: false,
        status: 'Meer informatie nodig',
      },
      {
        datePublished: '',
        isActive: false,
        isChecked: false,
        status: 'Afgehandeld',
      },
    ]);
  });

  it('exploitatieMeerInformatie - decision', () => {
    const termijn = {
      status: 'Meer informatie nodig',
      dateStart: '2025-01-02T00:00:00',
      dateEnd: '2025-01-16T00:00:00',
    };
    const exploitatieMeerInformatieDecision = {
      ...exploitatieBase,
      processed: true,
      dateDecision: `${MOCK_CURRENT_DATE}T00:00:00`,
      termijnDates: [termijn],
    } as unknown as VarenVergunningExploitatieType;

    expect(getStatusSteps(exploitatieMeerInformatieDecision)).toMatchObject([
      {},
      {},
      {},
      {
        datePublished: termijn.dateEnd,
        isActive: false,
        isChecked: true,
        status: 'In behandeling',
      },
      {
        datePublished: exploitatieMeerInformatieDecision.dateDecision,
        isActive: true,
        isChecked: true,
        status: 'Afgehandeld',
      },
    ]);
  });

  it('exploitatieDecision', () => {
    const exploitatieDecision = {
      ...exploitatieBase,
      processed: true,
      dateDecision: '2025-01-20T00:00:00',
      termijnDates: [],
    } as unknown as VarenVergunningExploitatieType;

    expect(getStatusSteps(exploitatieDecision)).toMatchObject([
      {
        datePublished: exploitatieDecision.dateRequest,
        isActive: false,
        isChecked: true,
        status: 'Ontvangen',
      },
      {
        datePublished: exploitatieDecision.dateRequest,
        isActive: false,
        isChecked: true,
        status: 'In behandeling',
      },
      {
        datePublished: exploitatieDecision.dateDecision,
        isActive: true,
        isChecked: true,
        status: 'Afgehandeld',
      },
    ]);
  });
});
