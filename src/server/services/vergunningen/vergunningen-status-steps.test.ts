import { describe, it, expect } from 'vitest';

import { VergunningFrontend, RVVSloterweg } from './config-and-types';
import { getStatusSteps, getDisplayStatus } from './vergunningen-status-steps';
import { StatusLineItem } from '../../../universal/types';

describe('vergunningen-status-steps', () => {
  describe('getStatusSteps', () => {
    it('should return correct steps for RVVSloterweg case type', () => {
      const vergunning = {
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
      } as VergunningFrontend<RVVSloterweg>;

      const steps = getStatusSteps(vergunning);
      expect(steps).toHaveLength(3);
      expect(steps[0]).toHaveProperty('status', 'Ontvangen');
      expect(steps[1]).toHaveProperty('status', 'In behandeling');
      expect(steps[2]).toHaveProperty('status', 'Afgehandeld');
      expect(steps?.[2].isActive).toBe(true);
    });

    it('should return correct steps for non-RVVSloterweg case type', () => {
      const vergunning = {
        caseType: 'Other',
        title: 'Vergunning',
        dateRequest: '2023-01-01',
        dateDecision: '2023-02-01',
        decision: 'Verleend',
        processed: true,
        isExpired: false,
      } as VergunningFrontend;

      const steps = getStatusSteps(vergunning);
      expect(steps).toHaveLength(3);
      expect(steps[0]).toHaveProperty('status', 'Ontvangen');
      expect(steps[1]).toHaveProperty('status', 'In behandeling');
      expect(steps[2]).toHaveProperty('status', 'Afgehandeld');
    });
  });

  describe('getDisplayStatus', () => {
    it('should return decision if processed and not expired', () => {
      const vergunning = {
        caseType: 'Other',
        title: 'Vergunning',
        processed: true,
        isExpired: false,
        decision: 'Verleend',
      } as VergunningFrontend;

      const steps: StatusLineItem[] = [];
      const status = getDisplayStatus(vergunning, steps);
      expect(status).toBe('Verleend');
    });

    it('should return active status from steps', () => {
      const vergunning = {
        caseType: 'Other',
        title: 'Vergunning',
        processed: false,
        isExpired: false,
      } as VergunningFrontend;

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
      } as VergunningFrontend;

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
