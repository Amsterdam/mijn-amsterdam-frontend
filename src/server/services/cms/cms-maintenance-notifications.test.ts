import mockdate from 'mockdate';

import {
  fetchActiveMaintenanceNotifications,
  fetchMaintenanceNotificationsDashboard,
  forTesting,
} from './cms-maintenance-notifications';
import type { CMSEventData, CMSMaintenanceNotification } from './cms-types';
import { remoteApiHost } from '../../../testing/setup';
import { remoteApi } from '../../../testing/utils';
import { apiSuccessResult } from '../../../universal/helpers/api';

type MockEventDataProps = {
  relUrl: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  env: string;
  severity: string;
};

function createMockCMSEventData({
  relUrl = '/test-notification',
  title = 'Test Notification',
  startDate = '2023-11-01',
  endDate = '2023-11-30',
  startTime = '08:00',
  endTime = '18:00',
  env = 'unittest',
  severity = 'error',
}: Partial<MockEventDataProps> = {}): CMSEventData {
  return {
    item: {
      relUrl,
      page: {
        title,
        cluster: {
          veld: [
            { Nam: 'Startdatum', Dtm: startDate },
            { Nam: 'Einddatum', Dtm: endDate },
            { Nam: 'Starttijd', Tyd: startTime },
            { Nam: 'Eindtijd', Tyd: endTime },
            { Nam: 'Toevoeging', Wrd: env },
            { Nam: 'Locatie', Wrd: severity },
            { Nam: 'Omschrijving', Src: `<p>${title} Description</p>` },
          ],
        },
      },
    },
  };
}

describe('cms-maintenance-notifications', () => {
  beforeAll(() => {
    mockdate.set('2023-11-15');
  });

  afterAll(() => {
    mockdate.reset();
  });

  describe('isOtapEnvMatch', () => {
    const { isOtapEnvMatch } = forTesting;

    it('should return true if the notification matches the current OTAP environment', () => {
      const notification = {
        otapEnvs: ['prd', 'acc', 'unittest'],
      } as CMSMaintenanceNotification;
      expect(isOtapEnvMatch(notification)).toBe(true);
    });

    it('should return false if the notification does not match the current OTAP environment', () => {
      const notification = { otapEnvs: ['tst'] } as CMSMaintenanceNotification;
      expect(isOtapEnvMatch(notification)).toBe(false);
    });

    it('should return false if the notification has no OTAP environments', () => {
      const notification = {
        otapEnvs: [],
      } as unknown as CMSMaintenanceNotification;
      expect(isOtapEnvMatch(notification)).toBe(false);
    });
  });

  describe('transformCMSEventResponse', () => {
    const { transformCMSEventResponse } = forTesting;

    it('should transform CMS event data into a CMSMaintenanceNotification', () => {
      const eventData: CMSEventData = createMockCMSEventData();

      const result = transformCMSEventResponse(eventData);

      expect(result).toEqual({
        dateEnd: '2023-11-30',
        datePublished: '2023-11-15T00:00:00.000Z',
        dateStart: '2023-11-01',
        description: '<p>Test Notification Description</p>',
        isAlert: true,
        otapEnvs: ['unittest'],
        path: '/test-notification',
        severity: 'error',
        themaID: 'NOTIFICATIONS',
        themaTitle: 'Alle berichten',
        timeEnd: '18:00',
        timeStart: '08:00',
        title: 'Test Notification',
      });
    });
  });

  describe('fetchCMSMaintenanceNotifications', () => {
    it('should fetch and transform CMS maintenance notifications', async () => {
      remoteApi
        .get(/storingsmeldingen\/alle-meldingen-mijn-amsterdam/)
        .reply(200, [
          { feedid: `${remoteApiHost}/other-page` },
          { feedid: `${remoteApiHost}/dashboard` },
        ]);

      const eventData1 = createMockCMSEventData({ relUrl: '/other-page' });
      const eventData2 = createMockCMSEventData({ relUrl: '/dashboard' });

      remoteApi.get(/\/other-page/).reply(200, eventData1);
      remoteApi.get(/\/dashboard/).reply(200, eventData2);

      const result = await forTesting.fetchCMSMaintenanceNotifications(false);

      expect(result.content).toHaveLength(2);
      expect(result.content?.[0].path).toBe('/other-page');
      expect(result.content?.[1].path).toBe('/dashboard');
    });

    it('should return an empty array if no feed items are available', async () => {
      remoteApi
        .get(/storingsmeldingen\/alle-meldingen-mijn-amsterdam/)
        .reply(200, []);
      const result = await forTesting.fetchCMSMaintenanceNotifications(false);

      expect(result).toEqual(apiSuccessResult([]));
    });

    it('should return an empty array if feed request fails', async () => {
      remoteApi
        .get(/storingsmeldingen\/alle-meldingen-mijn-amsterdam/)
        .reply(500);
      const result = await forTesting.fetchCMSMaintenanceNotifications(false);

      expect(result).toEqual({
        content: [],
        failedDependencies: {
          eventFeedResponse: {
            code: 500,
            content: null,
            message: 'Request failed with status code 500',
            status: 'ERROR',
          },
        },
        status: 'OK',
      });
    });
  });

  describe('fetchActiveMaintenanceNotifications', () => {
    it('should filter notifications based on query parameters', async () => {
      remoteApi
        .get(/storingsmeldingen\/alle-meldingen-mijn-amsterdam/)
        .reply(200, [
          { feedid: `${remoteApiHost}/other-page` },
          { feedid: `${remoteApiHost}/dashboard` },
        ]);

      const eventData1 = createMockCMSEventData({ relUrl: '/other-page' });
      const eventData2 = createMockCMSEventData({ relUrl: '/dashboard' });

      remoteApi.get(/\/other-page/).reply(200, eventData1);
      remoteApi.get(/\/dashboard/).reply(200, eventData2);

      const result = await fetchActiveMaintenanceNotifications({
        page: 'other-page',
      });

      expect(result.content).toHaveLength(1);
      expect(result.content?.[0].path).toBe('/other-page');
    });

    it('should return an empty array if no notifications are active', async () => {
      remoteApi
        .get(/storingsmeldingen\/alle-meldingen-mijn-amsterdam/)
        .reply(200, [
          { feedid: `${remoteApiHost}/other-page` },
          { feedid: `${remoteApiHost}/dashboard` },
        ]);

      const eventData1 = createMockCMSEventData({
        relUrl: '/other-page',
        startDate: '2023-12-01',
      });

      const eventData2 = createMockCMSEventData({
        relUrl: '/dashboard',
        endDate: '2022-12-01',
      });

      remoteApi.get(/\/other-page/).reply(200, eventData1);
      remoteApi.get(/\/dashboard/).reply(200, eventData2);

      const result = await fetchActiveMaintenanceNotifications({
        page: 'dashboard',
      });

      expect(result.content).toHaveLength(0);
    });
  });

  describe('fetchMaintenanceNotificationsDashboard', () => {
    it('should fetch notifications for the dashboard page', async () => {
      remoteApi
        .get(/storingsmeldingen\/alle-meldingen-mijn-amsterdam/)
        .reply(200, [
          { feedid: `${remoteApiHost}/other-page` },
          { feedid: `${remoteApiHost}/dashboard` },
        ]);

      const eventData1 = createMockCMSEventData({ relUrl: '/other-page' });
      const eventData2 = createMockCMSEventData({ relUrl: '/dashboard' });

      remoteApi.get(/\/other-page/).reply(200, eventData1);
      remoteApi.get(/\/dashboard/).reply(200, eventData2);

      const result = await fetchMaintenanceNotificationsDashboard();

      expect(result.content).toHaveLength(1);
      expect(result.content?.[0].path).toBe('/dashboard');
    });
  });
});
