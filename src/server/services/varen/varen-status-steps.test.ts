import MockDate from 'mockdate';
import { describe, expect, it } from 'vitest';

import { VarenVergunningExploitatieType } from './config-and-types';
import { getStatusSteps } from './varen-status-steps';

const exploitatieBase = {
  vesselName: 'boatName',
  processed: false,
  dateRequest: '2025-01-01T00:00:00',
} as unknown as VarenVergunningExploitatieType;

describe('getStatusSteps', () => {
  MockDate.set('2025-01-20');

  it('exploitatieInProgress', () => {
    const exploitatieInProgress = {
      ...exploitatieBase,
      statusDates: [],
      termijnDates: [],
    } as unknown as VarenVergunningExploitatieType;

    expect(getStatusSteps(exploitatieInProgress)).toStrictEqual([
      {
        datePublished: '2025-01-01T00:00:00',
        description: '',
        id: 'step-0',
        isActive: false,
        isChecked: true,
        status: 'Ontvangen',
      },
      {
        datePublished: '2025-01-01T00:00:00',
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
        status: 'Besluit',
      },
    ]);
  });

  it('exploitatieMeerInformatie', () => {
    const exploitatieMeerInformatieWithin = {
      ...exploitatieBase,
      statusDates: [
        {
          status: 'In behandeling',
          datePublished: '2025-01-01T00:00:00Z',
        },
      ],
      termijnDates: [
        {
          status: 'Meer informatie nodig',
          dateStart: '2025-01-02T00:00:00',
          dateEnd: '2025-01-16T00:00:00',
        },
        {
          status: 'Meer informatie nodig',
          dateStart: '2025-01-17T00:00:00',
          dateEnd: '2025-01-30T00:00:00',
        },
      ],
    } as unknown as VarenVergunningExploitatieType;

    expect(getStatusSteps(exploitatieMeerInformatieWithin)).toStrictEqual([
      {
        datePublished: '2025-01-01T00:00:00',
        description: '',
        id: 'step-0',
        isActive: false,
        isChecked: true,
        status: 'Ontvangen',
      },
      {
        datePublished: '2025-01-01T00:00:00',
        description: '',
        id: 'step-1',
        isActive: false,
        isChecked: true,
        status: 'In behandeling',
      },
      {
        actionButtonItems: [],
        datePublished: '2025-01-02T00:00:00',
        description: '',
        id: 'step-2',
        isActive: false,
        isChecked: true,
        status: 'Meer informatie nodig',
      },
      {
        datePublished: '2025-01-16T00:00:00',
        description: '',
        id: 'step-3',
        isActive: false,
        isChecked: true,
        status: 'In behandeling',
      },
      {
        actionButtonItems: [],
        datePublished: '2025-01-17T00:00:00',
        description:
          'Er is meer informatie nodig om uw aanvraag verder te kunnen verwerken. Lever deze informatie aan voor 30 januari 2025',
        id: 'step-4',
        isActive: true,
        isChecked: false,
        status: 'Meer informatie nodig',
      },
      {
        datePublished: '',
        id: 'step-5',
        isActive: false,
        isChecked: false,
        status: 'Besluit',
      },
    ]);
  });

  it('exploitatieMeerInformatie in behandeling', () => {
    const exploitatieMeerInformatieAfter = {
      ...exploitatieBase,
      statusDates: [
        {
          status: 'In behandeling',
          datePublished: '2025-01-01T00:00:00Z',
        },
      ],
      termijnDates: [
        {
          status: 'Meer informatie nodig',
          dateStart: '2025-01-02T00:00:00',
          dateEnd: '2025-01-16T00:00:00',
        },
      ],
    } as unknown as VarenVergunningExploitatieType;

    expect(getStatusSteps(exploitatieMeerInformatieAfter)).toStrictEqual([
      {
        datePublished: '2025-01-01T00:00:00',
        description: '',
        id: 'step-0',
        isActive: false,
        isChecked: true,
        status: 'Ontvangen',
      },
      {
        datePublished: '2025-01-01T00:00:00',
        description: '',
        id: 'step-1',
        isActive: false,
        isChecked: true,
        status: 'In behandeling',
      },
      {
        actionButtonItems: [],
        datePublished: '2025-01-02T00:00:00',
        description: '',
        id: 'step-2',
        isActive: false,
        isChecked: true,
        status: 'Meer informatie nodig',
      },
      {
        datePublished: '2025-01-16T00:00:00',
        description: '',
        id: 'step-3',
        isActive: true,
        isChecked: false,
        status: 'In behandeling',
      },
      {
        datePublished: '',
        id: 'step-4',
        isActive: false,
        isChecked: false,
        status: 'Besluit',
      },
    ]);
  });

  it('exploitatieMeerInformatie has termijn overlap', () => {
    const exploitatieMeerInformatieOverlap = {
      ...exploitatieBase,
      statusDates: [
        {
          status: 'In behandeling',
          datePublished: '2025-01-01T00:00:00Z',
        },
      ],
      termijnDates: [
        {
          status: 'Meer informatie nodig',
          dateStart: '2025-01-02T00:00:00',
          dateEnd: '2025-01-16T00:00:00',
        },
        {
          status: 'Meer informatie nodig',
          dateStart: '2025-01-10T00:00:00',
          dateEnd: '2025-01-24T00:00:00',
        },
      ],
    } as unknown as VarenVergunningExploitatieType;

    expect(getStatusSteps(exploitatieMeerInformatieOverlap)).toStrictEqual([
      {
        datePublished: '2025-01-01T00:00:00',
        description: '',
        id: 'step-0',
        isActive: false,
        isChecked: true,
        status: 'Ontvangen',
      },
      {
        datePublished: '2025-01-01T00:00:00',
        description: '',
        id: 'step-1',
        isActive: false,
        isChecked: true,
        status: 'In behandeling',
      },
      {
        actionButtonItems: [],
        datePublished: '2025-01-02T00:00:00',
        description: '',
        id: 'step-2',
        isActive: false,
        isChecked: true,
        status: 'Meer informatie nodig',
      },
      {
        datePublished: '2025-01-10T00:00:00',
        description: '',
        id: 'step-3',
        isActive: false,
        isChecked: true,
        status: 'In behandeling',
      },
      {
        actionButtonItems: [],
        datePublished: '2025-01-10T00:00:00',
        description:
          'Er is meer informatie nodig om uw aanvraag verder te kunnen verwerken. Lever deze informatie aan voor 24 januari 2025',
        id: 'step-4',
        isActive: true,
        isChecked: false,
        status: 'Meer informatie nodig',
      },
      {
        datePublished: '',
        id: 'step-5',
        isActive: false,
        isChecked: false,
        status: 'Besluit',
      },
    ]);
  });

  it('exploitatieMeerInformatie - decision', () => {
    const exploitatieMeerInformatieDecision = {
      ...exploitatieBase,
      processed: true,
      dateDecision: '2025-01-20T00:00:00',
      statusDates: [
        {
          status: 'In behandeling',
          datePublished: '2025-01-01T00:00:00Z',
        },
      ],
      termijnDates: [
        {
          status: 'Meer informatie nodig',
          dateStart: '2025-01-02T00:00:00',
          dateEnd: '2025-01-16T00:00:00',
        },
      ],
    } as unknown as VarenVergunningExploitatieType;

    expect(getStatusSteps(exploitatieMeerInformatieDecision)).toStrictEqual([
      {
        datePublished: '2025-01-01T00:00:00',
        description: '',
        id: 'step-0',
        isActive: false,
        isChecked: true,
        status: 'Ontvangen',
      },
      {
        datePublished: '2025-01-01T00:00:00',
        description: '',
        id: 'step-1',
        isActive: false,
        isChecked: true,
        status: 'In behandeling',
      },
      {
        actionButtonItems: [],
        datePublished: '2025-01-02T00:00:00',
        description: '',
        id: 'step-2',
        isActive: false,
        isChecked: true,
        status: 'Meer informatie nodig',
      },
      {
        datePublished: '2025-01-16T00:00:00',
        description: '',
        id: 'step-3',
        isActive: false,
        isChecked: true,
        status: 'In behandeling',
      },
      {
        datePublished: '2025-01-20T00:00:00',
        id: 'step-4',
        isActive: true,
        isChecked: true,
        status: 'Besluit',
      },
    ]);
  });

  it('exploitatieDecision', () => {
    const exploitatieDecision = {
      ...exploitatieBase,
      processed: true,
      dateDecision: '2025-01-20T00:00:00',
      statusDates: [
        {
          status: 'In behandeling',
          datePublished: '2025-01-01T00:00:00Z',
        },
      ],
      termijnDates: [],
    } as unknown as VarenVergunningExploitatieType;

    expect(getStatusSteps(exploitatieDecision)).toStrictEqual([
      {
        datePublished: '2025-01-01T00:00:00',
        description: '',
        id: 'step-0',
        isActive: false,
        isChecked: true,
        status: 'Ontvangen',
      },
      {
        datePublished: '2025-01-01T00:00:00',
        description: '',
        id: 'step-1',
        isActive: false,
        isChecked: true,
        status: 'In behandeling',
      },
      {
        datePublished: '2025-01-20T00:00:00',
        id: 'step-2',
        isActive: true,
        isChecked: true,
        status: 'Besluit',
      },
    ]);
  });
});
