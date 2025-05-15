import { describe, it, expect } from 'vitest';

import { RVVSloterweg } from './config-and-types';
import { getStatusSteps } from './vergunningen-status-steps';
import { StatusLineItem } from '../../../universal/types/App.types';
import { getDisplayStatus } from '../decos/decos-helpers';
import type { DecosZaakBase } from '../decos/decos-types';

describe('vergunningen-status-steps', () => {
  describe('getStatusSteps', () => {
    it('should return correct steps for RVVSloterweg case type', () => {
      const zaak = {
        caseType: 'RVV Sloterweg',
        title: 'RVV ontheffing',
        requestType: 'Nieuw',
        dateRequest: '2023-01-01',
        dateWorkflowVerleend: '2023-02-01',
        decision: 'Verleend',
        area: 'Sloterweg-West',
        kentekens: 'AB-123-CD',
        processed: true,
        isExpired: false,
      } as unknown as RVVSloterweg;

      const steps = getStatusSteps(zaak);
      expect(steps).toHaveLength(3);
      expect(steps[0]).toHaveProperty('status', 'Ontvangen');
      expect(steps[1]).toHaveProperty('status', 'In behandeling');
      expect(steps[2]).toHaveProperty('status', 'Afgehandeld');
      expect(steps?.[2].isActive).toBe(true);
    });

    it('should return correct steps for non-RVVSloterweg case type, active step Agehandeld', () => {
      const zaak = {
        caseType: 'Other',
        title: 'Vergunning',
        dateRequest: '2023-01-01',
        dateDecision: '2023-02-01',
        decision: 'Verleend',
        isVerleend: true,
        processed: true,
        isExpired: false,
        statusDates: [],
      } as unknown as DecosZaakBase;

      const steps = getStatusSteps(zaak);
      expect(steps).toStrictEqual([
        {
          datePublished: '2023-01-01',
          description: '',
          documents: [],
          id: 'step-1',
          isActive: false,
          isChecked: true,
          status: 'Ontvangen',
        },
        {
          datePublished: '',
          description: '',
          documents: [],
          id: 'step-2',
          isActive: false,
          isChecked: true,
          status: 'In behandeling',
        },
        {
          datePublished: '2023-02-01',
          description:
            'Wij hebben uw aanvraag Vergunning <strong>Verleend</strong>',
          documents: [],
          id: 'step-3',
          isActive: true,
          isChecked: true,
          status: 'Afgehandeld',
        },
        {
          datePublished: '',
          description: '',
          id: 'step-4',
          isActive: false,
          isChecked: false,
          status: 'Verlopen',
        },
      ]);
    });

    it('should return correct steps for non-RVVSloterweg case type, active step Agehandeld, with end date and time', () => {
      const zaak = {
        caseType: 'Other',
        title: 'Vergunning',
        dateRequest: '2023-01-01',
        dateDecision: '2023-02-01',
        dateEnd: '2023-02-02',
        dateEndFormatted: '02 februari 2023',
        timeEnd: '12:00',
        decision: 'Verleend',
        isVerleend: true,
        processed: true,
        isExpired: false,
        statusDates: [],
      } as unknown as DecosZaakBase;

      const steps = getStatusSteps(zaak);
      expect(steps).toMatchObject([
        {},
        {},
        {},
        {
          datePublished: '',
          description:
            'Uw vergunning verloopt op 02 februari 2023 om 12.00 uur.',
          id: 'step-4',
          isActive: false,
          isChecked: false,
          status: 'Verlopen',
        },
      ]);
    });

    it('should return correct steps for non-RVVSloterweg case type, active step In behandeling', () => {
      const zaak = {
        caseType: 'Other',
        title: 'Vergunning',
        dateRequest: '2023-01-01',
        dateDecision: '',
        decision: '',
        processed: false,
        isExpired: false,
        statusDates: [
          { status: 'In behandeling', datePublished: '2023-01-15' },
        ],
      } as unknown as DecosZaakBase;

      const steps = getStatusSteps(zaak);
      expect(steps).toStrictEqual([
        {
          datePublished: '2023-01-01',
          description: '',
          documents: [],
          id: 'step-1',
          isActive: false,
          isChecked: true,
          status: 'Ontvangen',
        },
        {
          datePublished: '2023-01-15',
          description: '',
          documents: [],
          id: 'step-2',
          isActive: true,
          isChecked: true,
          status: 'In behandeling',
        },
        {
          datePublished: '',
          description: '',
          documents: [],
          id: 'step-3',
          isActive: false,
          isChecked: false,
          status: 'Afgehandeld',
        },
      ]);
    });
    it('should return correct steps for non-RVVSloterweg case type, expired step', () => {
      const zaak = {
        caseType: 'Other',
        title: 'Vergunning',
        dateRequest: '2023-01-01',
        dateDecision: '2023-02-01',
        dateEnd: '2023-03-01',
        decision: 'Verleend',
        isVerleend: true,
        processed: true,
        isExpired: true,
      } as unknown as DecosZaakBase;

      const steps = getStatusSteps(zaak);
      expect(steps).toStrictEqual([
        {
          datePublished: '2023-01-01',
          description: '',
          documents: [],
          id: 'step-1',
          isActive: false,
          isChecked: true,
          status: 'Ontvangen',
        },
        {
          datePublished: '',
          description: '',
          documents: [],
          id: 'step-2',
          isActive: false,
          isChecked: true,
          status: 'In behandeling',
        },
        {
          datePublished: '2023-02-01',
          description:
            'Wij hebben uw aanvraag Vergunning <strong>Verleend</strong>',
          documents: [],
          id: 'step-3',
          isActive: false,
          isChecked: true,
          status: 'Afgehandeld',
        },
        {
          datePublished: '2023-03-01',
          description: 'Uw Vergunning is verlopen.',
          id: 'step-4',
          isActive: true,
          isChecked: true,
          status: 'Verlopen',
        },
      ]);
    });
  });

  describe('getDisplayStatus', () => {
    it('should return decision if Afgehandeld is active', () => {
      const zaak = {
        decision: 'Verleend',
      } as unknown as DecosZaakBase;
      const steps = [
        { status: 'Afgehandeld', isActive: true },
      ] as StatusLineItem[];
      const status = getDisplayStatus(zaak, steps);
      expect(status).toBe('Verleend');
    });

    it('should return active status from steps', () => {
      const vergunning = {
        caseType: 'Other',
        title: 'Vergunning',
        processed: false,
        isExpired: false,
      } as unknown as DecosZaakBase;

      const steps: StatusLineItem[] = [
        {
          id: 'step-1',
          status: 'Ontvangen',
          isActive: false,
          isChecked: true,
          datePublished: '',
          description: '',
          documents: [],
        },
        {
          id: 'step-2',
          status: 'In behandeling',
          isActive: true,
          isChecked: true,
          datePublished: '',
          description: '',
          documents: [],
        },
        {
          id: 'step-3',
          status: 'Afgehandeld',
          isActive: false,
          isChecked: false,
          datePublished: '',
          description: '',
          documents: [],
        },
      ];
      const status = getDisplayStatus(vergunning, steps);
      expect(status).toBe('In behandeling');
    });

    it('should return "Onbekend" if no active status in steps', () => {
      const vergunning = {
        caseType: 'Other',
        title: 'Vergunning',
        processed: false,
        isExpired: false,
      } as unknown as DecosZaakBase;

      const steps: StatusLineItem[] = [
        {
          id: 'step-1',
          status: 'Ontvangen',
          isActive: false,
          isChecked: true,
          datePublished: '',
          description: '',
          documents: [],
        },
        {
          id: 'step-2',
          status: 'In behandeling',
          isActive: false,
          isChecked: true,
          datePublished: '',
          description: '',
          documents: [],
        },
      ];
      const status = getDisplayStatus(vergunning, steps);
      expect(status).toBe('Onbekend');
    });
  });
});
