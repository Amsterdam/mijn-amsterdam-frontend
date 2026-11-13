import { describe, expect, it } from 'vitest';

import type { ServiceAlertsOverview } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import { myThemasMenuItems } from '../../../bob/config/thema.ts';
import {
  getServiceAlertDisplayLocationLabel,
  getServiceAlertGroups,
  getServiceAlertTypeLabel,
} from './ServiceAlerts.helpers.ts';

const now = new Date('2026-11-11T12:00:00.000Z');

function createServiceAlert(
  id: string,
  dateStart: string,
  dateEnd: string
): ServiceAlertsOverview[number] {
  return {
    id,
    title: id,
    body: '',
    type: 'info',
    displayLocation: 'theme',
    themaId: 'test',
    createdByEmail: null,
    updatedByEmail: null,
    links: [],
    dateStart,
    dateEnd,
  };
}

describe('getServiceAlertGroups', () => {
  it('groups alerts as active, upcoming, or past based on their date range', () => {
    const overview = [
      createServiceAlert(
        'active',
        '2026-11-11T11:00:00.000Z',
        '2026-11-11T13:00:00.000Z'
      ),
      createServiceAlert(
        'upcoming',
        '2026-11-11T13:00:00.000Z',
        '2026-11-11T14:00:00.000Z'
      ),
      createServiceAlert(
        'past',
        '2026-11-11T10:00:00.000Z',
        '2026-11-11T11:00:00.000Z'
      ),
    ];

    expect(getServiceAlertGroups(overview, now)).toEqual({
      active: [overview[0]],
      upcoming: [overview[1]],
      past: [overview[2]],
    });
  });

  describe('getServiceAlertTypeLabel', () => {
    it.each([
      ['info', 'Informatie'],
      ['warning', 'Waarschuwing'],
      ['error', 'Storing'],
    ] as const)('translates %s to %s', (type, label) => {
      expect(getServiceAlertTypeLabel(type)).toBe(label);
    });
  });

  describe('getServiceAlertDisplayLocationLabel', () => {
    it('includes the theme name for theme alerts', () => {
      const thema = myThemasMenuItems.find(
        ({ title }) => typeof title === 'string'
      );

      expect(thema).toBeDefined();
      expect(
        getServiceAlertDisplayLocationLabel('theme', thema?.id ?? null)
      ).toBe(`Thema: ${thema?.title}`);
    });

    it.each([
      ['notification', 'Notificatie'],
      ['dashboard', 'Dashboard'],
    ] as const)('translates %s to %s', (displayLocation, label) => {
      expect(getServiceAlertDisplayLocationLabel(displayLocation, null)).toBe(
        label
      );
    });

    it('falls back to the theme ID when the theme is unknown', () => {
      expect(getServiceAlertDisplayLocationLabel('theme', 'unknown')).toBe(
        'Thema: unknown'
      );
    });
  });

  it('considers alerts active at their start and end times', () => {
    const atStart = createServiceAlert(
      'at-start',
      now.toISOString(),
      '2026-11-11T13:00:00.000Z'
    );
    const atEnd = createServiceAlert(
      'at-end',
      '2026-11-11T11:00:00.000Z',
      now.toISOString()
    );

    expect(getServiceAlertGroups([atStart, atEnd], now).active).toEqual([
      atStart,
      atEnd,
    ]);
  });
});
