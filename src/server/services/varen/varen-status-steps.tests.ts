import { describe, it, expect } from 'vitest';

import { Varen } from './config-and-types';
import { getStatusSteps } from './varen-status-steps';

describe('varen-status-steps', () => {
  describe('getStatusSteps', () => {
    it('should return correct steps for a new request', () => {
      const decosZaak: Varen = {
        processed: false,
        dateRequest: '2023-01-01',
        termijnDates: [],
        linkDataRequest: null,
        dateDecision: null,
      };

      const steps = getStatusSteps(decosZaak);
      expect(steps).toHaveLength(3);
      expect(steps[0]).toHaveProperty('status', 'Ontvangen');
      expect(steps[1]).toHaveProperty('status', 'In behandeling');
      expect(steps[2]).toHaveProperty('status', 'Besluit');
    });

    it('should return correct steps for a request in behandeling', () => {
      const decosZaak: Varen = {
        processed: false,
        dateRequest: '2023-01-01',
        termijnDates: [],
        linkDataRequest: null,
        dateDecision: null,
      };

      const steps = getStatusSteps(decosZaak);
      expect(steps).toHaveLength(3);
      expect(steps[0]).toHaveProperty('status', 'Ontvangen');
      expect(steps[1]).toHaveProperty('status', 'In behandeling');
      expect(steps[2]).toHaveProperty('status', 'Besluit');
    });

    it('should return correct steps for a request with multiple termijnen', () => {
      const decosZaak: Varen = {
        processed: false,
        dateRequest: '2023-01-01',
        termijnDates: [
          { dateStart: '2023-02-01', dateEnd: '2023-03-01' },
          { dateStart: '2023-04-01', dateEnd: '2023-05-01' },
        ],
        linkDataRequest: null,
        dateDecision: null,
      };

      const steps = getStatusSteps(decosZaak);
      expect(steps).toHaveLength(5);
      expect(steps[0]).toHaveProperty('status', 'Ontvangen');
      expect(steps[1]).toHaveProperty('status', 'In behandeling');
      expect(steps[2]).toHaveProperty('status', 'Meer informatie nodig');
      expect(steps[3]).toHaveProperty('status', 'In behandeling');
      expect(steps[4]).toHaveProperty('status', 'Besluit');
    });

    it('should return correct steps for a request that needs more information', () => {
      const decosZaak: Varen = {
        processed: false,
        dateRequest: '2023-01-01',
        termijnDates: [{ dateStart: '2023-02-01', dateEnd: '2023-03-01' }],
        linkDataRequest: 'https://example.com',
        dateDecision: null,
      };

      const steps = getStatusSteps(decosZaak);
      expect(steps).toHaveLength(4);
      expect(steps[0]).toHaveProperty('status', 'Ontvangen');
      expect(steps[1]).toHaveProperty('status', 'In behandeling');
      expect(steps[2]).toHaveProperty('status', 'Meer informatie nodig');
      expect(steps[2]).toHaveProperty('actionButtonItems', [
        { to: 'https://example.com', title: 'Documenten nasturen' },
      ]);
      expect(steps[3]).toHaveProperty('status', 'Besluit');
    });

    it('should return correct steps for a request that has a decision', () => {
      const decosZaak: Varen = {
        processed: true,
        dateRequest: '2023-01-01',
        termijnDates: [],
        linkDataRequest: null,
        dateDecision: '2023-02-01',
      };

      const steps = getStatusSteps(decosZaak);
      expect(steps).toHaveLength(3);
      expect(steps[0]).toHaveProperty('status', 'Ontvangen');
      expect(steps[1]).toHaveProperty('status', 'In behandeling');
      expect(steps[2]).toHaveProperty('status', 'Besluit');
      expect(steps[2]).toHaveProperty('datePublished', '2023-02-01');
    });
  });
});
