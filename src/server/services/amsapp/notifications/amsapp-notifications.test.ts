/* eslint-disable import/order */
import {
  beforeEach,
  beforeAll,
  afterAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { DISCRETE_GENERIC_MESSAGE } from './amsapp-notifications-service-config.ts';
import type { ServiceId } from './amsapp-notifications-types.ts';
import type { NotificationsAndTipsResponse } from '../../tips-and-notifications.ts';

type ServiceResponses = Partial<
  Record<ServiceId, NotificationsAndTipsResponse>
>;

const mocks = vi.hoisted(() => {
  return {
    model: {
      listProfileIds: vi.fn(),
      listConsumerIds: vi.fn(),
      upsertConsumer: vi.fn(),
      deleteOrphanProfiles: vi.fn(),
      listProfiles: vi.fn(),
      truncate: vi.fn(),
      deleteConsumers: vi.fn(),
      getProfileByConsumer: vi.fn(),
      storeNotifications: vi.fn(),
    },
    authHelpers: {
      getAuthProfileAndTokenWithoutSession: vi.fn(),
    },
    sourceApiRequest: {
      requestData: vi.fn(),
    },
    tipsAndNotifications: {
      fetchNotificationsAndTipsFromServices: vi.fn(),
      notificationServices: {
        private: {
          afis: vi.fn(),
          avg: vi.fn(),
          belasting: vi.fn(),
        },
      },
    },
  };
});

vi.mock('./amsapp-notifications-model', () => mocks.model);
vi.mock('./amsapp-notifications-helper', () => mocks.authHelpers);
vi.mock('../../../helpers/source-api-request.ts', () => mocks.sourceApiRequest);
vi.mock('../../tips-and-notifications', () => mocks.tipsAndNotifications);

import {
  batchFetchAndStoreNotifications,
  unregisterExpiredConsumers,
  getConsumerProfile,
  storeNotificationsResponses,
} from './amsapp-notifications.ts';

describe('amsapp-notifications', () => {
  const systemTime = new Date('2000-01-01T12:00:00.000Z');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(systemTime);

    mocks.model.listConsumerIds.mockResolvedValue([]);
    mocks.model.listProfileIds.mockResolvedValue([]);
    mocks.sourceApiRequest.requestData.mockResolvedValue({
      status: 'OK',
      content: null,
    });
    mocks.authHelpers.getAuthProfileAndTokenWithoutSession.mockImplementation(
      (profileId: string) => ({
        profile: {
          id: profileId,
          profileType: 'private',
          authMethod: 'digid',
          sid: 'sid',
        },
        token: 'token',
        expiresAtMilliseconds: 1,
      })
    );
    mocks.tipsAndNotifications.fetchNotificationsAndTipsFromServices.mockResolvedValue(
      {}
    );
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  describe('Consumer', () => {
    it('getConsumerProfile returns profile data + isRegistered=true when found', async () => {
      mocks.model.getProfileByConsumer.mockResolvedValue({
        profileName: 'Jane Doe',
        serviceIds: ['afis'],
        dateUpdated: new Date('2026-03-01T00:00:00.000Z'),
        lastLoginDate: new Date('2026-04-01T00:00:00.000Z'),
        loginExpiryDate: new Date('2026-06-01T00:00:00.000Z'),
      });

      await expect(getConsumerProfile('consumer-1')).resolves.toStrictEqual({
        profileName: 'Jane Doe',
        serviceIds: ['afis'],
        dateUpdated: '2026-03-01T00:00:00.000Z',
        lastLoginDate: '2026-04-01T00:00:00.000Z',
        loginExpiryDate: '2026-06-01T00:00:00.000Z',
        isRegistered: true,
      });
    });

    it('getConsumerProfile returns {isRegistered:false} when not found', async () => {
      mocks.model.getProfileByConsumer.mockResolvedValue(null);

      await expect(getConsumerProfile('consumer-1')).resolves.toStrictEqual({
        isRegistered: false,
      });
    });
  });

  describe('unregisterExpiredConsumers', () => {
    it('removes consumers selected by expiry cutoff when cron cleanup runs', async () => {
      mocks.model.listConsumerIds.mockResolvedValue(['expired-1']);
      mocks.model.deleteConsumers.mockResolvedValue(['expired-1']);

      await unregisterExpiredConsumers(systemTime);

      expect(mocks.model.listConsumerIds).toHaveBeenCalledWith(systemTime);
      expect(mocks.model.deleteConsumers).toHaveBeenCalledWith(['expired-1']);
    });

    it('is best effort and still removes consumers when webhook delivery fails', async () => {
      mocks.model.listConsumerIds.mockResolvedValue(['expired-1']);
      mocks.model.deleteConsumers.mockResolvedValue(['expired-1']);
      mocks.sourceApiRequest.requestData.mockResolvedValue({
        status: 'ERROR',
        content: null,
        message: 'timeout',
      });

      await expect(
        unregisterExpiredConsumers(systemTime)
      ).resolves.toBeUndefined();

      expect(mocks.model.deleteConsumers).toHaveBeenCalledWith(['expired-1']);
    });
  });

  describe('batchFetchAndStoreNotifications', () => {
    it('fetches and stores notifications without running cron cleanup', async () => {
      mocks.model.listProfileIds.mockResolvedValue([
        {
          profileId: '123456789',
          serviceIds: ['afis'],
        },
      ]);

      await batchFetchAndStoreNotifications();

      expect(mocks.model.listConsumerIds).not.toHaveBeenCalled();
      expect(
        mocks.tipsAndNotifications.fetchNotificationsAndTipsFromServices
      ).toHaveBeenCalledTimes(1);
      expect(mocks.model.storeNotifications).toHaveBeenCalledTimes(1);
    });
  });

  it('storeNotificationsResponses transforms and stores notifications by service and ignores tips and notifications without datePublished', async () => {
    mocks.model.storeNotifications.mockResolvedValue(undefined);

    const serviceResponses: ServiceResponses = {
      afis: {
        status: 'OK',
        content: {
          notifications: [
            {
              id: 'n-tip',
              themaID: 'THEMA',
              themaTitle: 'Thema',
              title: 'Tip',
              isTip: true,
              isAlert: false,
              datePublished: '2026-03-07',
            },
            {
              id: 'n-no-date',
              themaID: 'THEMA',
              themaTitle: 'Thema',
              title: 'No date',
              isAlert: false,
              datePublished: '',
            },
            {
              id: 'n-1',
              themaID: 'THEMA',
              themaTitle: 'Thema',
              title: 'Actual title (should be hidden)',
              isAlert: true,
              datePublished: '2026-03-06T00:00:00.000Z',
            },
          ],
        },
      },
      avg: {
        status: 'ERROR',
        content: null,
        message: 'failed',
      },
    };

    await storeNotificationsResponses('123456789', serviceResponses);

    expect(mocks.model.storeNotifications).toHaveBeenCalledTimes(1);

    const [profileIdArg, servicesArg, lastLoginDateArg] =
      mocks.model.storeNotifications.mock.calls[0];

    expect(profileIdArg).toBe('123456789');
    expect(servicesArg).toHaveLength(1);
    expect(lastLoginDateArg).toBeNull();

    expect(servicesArg[0]).toStrictEqual({
      serviceId: 'afis',
      dateUpdated: systemTime.toISOString(),
      status: 'OK',
      content: [
        {
          id: 'n-1',
          title: DISCRETE_GENERIC_MESSAGE,
          datePublished: '2026-03-06T00:00:00.000Z',
        },
      ],
    });
  });

  it('storeNotificationsResponses stores an empty array when all service responses are not OK', async () => {
    mocks.model.storeNotifications.mockResolvedValue(undefined);

    const serviceResponses: ServiceResponses = {
      afis: {
        status: 'ERROR',
        content: null,
        message: 'nope',
      },
    };

    await storeNotificationsResponses('123456789', serviceResponses);

    expect(mocks.model.storeNotifications).toHaveBeenCalledWith(
      '123456789',
      [],
      null
    );
  });

  it('storeNotificationsResponses updates lastLoginDate when updateLastLoginDate=true', async () => {
    mocks.model.storeNotifications.mockResolvedValue(undefined);

    await storeNotificationsResponses(
      '123456789',
      {
        afis: {
          status: 'OK',
          content: { notifications: [] },
        },
      },
      { updateLastLoginDate: true }
    );

    expect(mocks.model.storeNotifications).toHaveBeenCalledWith(
      '123456789',
      expect.any(Array),
      systemTime
    );
  });

  // TODO: MIJN-12971: These are temporary tests and can be deleted when notifications datePublished for these services are not set to todays date everytime anymore
  it('storeNotificationsResponses does not store temporary filtered services', async () => {
    mocks.model.storeNotifications.mockResolvedValue(undefined);

    await storeNotificationsResponses(
      '123456789',
      {
        afis: {
          status: 'OK',
          content: { notifications: [] },
        },
        belasting: {
          status: 'OK',
          content: { notifications: [] },
        },
      },
      { updateLastLoginDate: true }
    );

    expect(mocks.model.storeNotifications).toHaveBeenCalledWith(
      '123456789',
      [
        {
          serviceId: 'afis',
          dateUpdated: systemTime.toISOString(),
          status: 'OK',
          content: [],
        },
      ],
      systemTime
    );
  });
});
