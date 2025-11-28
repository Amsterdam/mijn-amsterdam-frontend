import { getStatusSteps } from './bed-and-breakfast-status-steps';
import { BBVergunningFrontend } from './bed-and-breakfast-types';

describe('transformZaakStatusResponse', () => {
  test('should transform zaak status response correctly', () => {
    const zaak = {
      id: 'test-zaak-id',
      dateRequest: '2023-01-01',
      dateDecision: '2023-02-01',
      dateEnd: '2023-12-31',
      decision: 'Verleend',
      isExpired: true,
      documents: [
        {
          title: 'Verzoek aanvullende gegevens',
          datePublished: '2023-01-15',
          url: 'https://example.com/document',
        },
      ],
      statusDates: [
        {
          status: 'In behandeling',
          datePublished: '2023-01-10',
        },
        {
          status: 'Afgehandeld',
          datePublished: '2023-02-01',
        },
      ],
    } as unknown as BBVergunningFrontend;

    const result = getStatusSteps(zaak);

    expect(result).toEqual([
      {
        id: 'step-1',
        status: 'Ontvangen',
        datePublished: '2023-01-01',
        isActive: false,
        isChecked: true,
      },
      {
        id: 'step-meer-info',
        status: 'Meer informatie nodig',
        datePublished: '2023-01-15',
        isActive: false,
        isChecked: true,
        description:
          '<p>Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.</p><p>Bekijk de <a href="https://example.com/document">brief</a> voor meer details.</p>',
      },
      {
        id: 'step-2',
        status: 'In behandeling',
        datePublished: '2023-01-10',
        isActive: false,
        isChecked: true,
      },
      {
        id: 'step-3',
        status: 'Afgehandeld',
        datePublished: '2023-02-01',
        isActive: false,
        isChecked: true,
      },
      {
        id: 'step-5',
        status: 'Verlopen',
        datePublished: '2023-12-31',
        isActive: true,
        isChecked: true,
      },
    ]);
  });

  test('should handle case with no result and no documents', () => {
    const zaak = {
      id: 'test-zaak-id',
      dateRequest: '2023-01-01',
      dateDecision: null,
      dateEnd: null,
      decision: null,
      documents: [],
      statusDates: [
        {
          status: 'In behandeling',
          datePublished: '2023-01-10',
        },
      ],
    } as unknown as BBVergunningFrontend;

    const result = getStatusSteps(zaak);
    expect(result).toEqual([
      {
        id: 'step-1',
        status: 'Ontvangen',
        datePublished: '2023-01-01',
        isActive: false,
        isChecked: true,
      },
      {
        id: 'step-2',
        status: 'In behandeling',
        datePublished: '2023-01-10',
        isActive: true,
        isChecked: true,
      },
      {
        id: 'step-3',
        status: 'Afgehandeld',
        datePublished: '',
        isActive: false,
        isChecked: false,
      },
    ]);
  });

  test('should handle case with no status response', () => {
    const zaak = {
      id: 'test-zaak-id',
      dateRequest: '2023-01-01',
      dateDecision: null,
      dateEnd: null,
      decision: null,
      documents: [],
      statusDates: [],
    } as unknown as BBVergunningFrontend;

    const result = getStatusSteps(zaak);
    expect(result).toEqual([
      {
        id: 'step-1',
        status: 'Ontvangen',
        datePublished: '2023-01-01',
        isActive: true,
        isChecked: true,
      },
      {
        id: 'step-2',
        status: 'In behandeling',
        datePublished: '',
        isActive: false,
        isChecked: false,
      },
      {
        id: 'step-3',
        status: 'Afgehandeld',
        datePublished: '',
        isActive: false,
        isChecked: false,
      },
    ]);
  });
});
