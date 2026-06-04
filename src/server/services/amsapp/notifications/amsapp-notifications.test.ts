/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

const mocks = vi.hoisted(() => {
  return {
    model: {
      listProfileIds: vi.fn(),
      listConsumerIdsWithLoginExpiryDateBefore: vi.fn(),
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
          serviceA: vi.fn(),
          serviceB: vi.fn(),
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
  registerConsumer,
  storeNotificationsResponses,
} from './amsapp-notifications.ts';

describe('amsapp-notifications', () => {
  const systemTime = new Date('2000-01-01T12:00:00.000Z');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(systemTime);

    mocks.model.listConsumerIdsWithLoginExpiryDateBefore.mockResolvedValue([]);
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
    it('registerConsumer upserts and starts removing orphan profiles (in the background)', async () => {
      mocks.model.upsertConsumer.mockResolvedValue(undefined);
      mocks.model.deleteOrphanProfiles.mockResolvedValue(undefined);

      await registerConsumer('123456789', 'Jane Doe', 'consumer-1', [
        'serviceA',
      ] as any);

      expect(mocks.model.upsertConsumer).toHaveBeenCalled();
      expect(mocks.model.deleteOrphanProfiles).toHaveBeenCalled();
    });

    it('getConsumerProfile returns profile data + isRegistered=true when found', async () => {
      mocks.model.getProfileByConsumer.mockResolvedValue({
        profileName: 'Jane Doe',
        serviceIds: ['serviceA'],
        dateUpdated: new Date('2026-03-01T00:00:00.000Z'),
        lastLoginDate: new Date('2026-04-01T00:00:00.000Z'),
        loginExpiryDate: new Date('2026-06-01T00:00:00.000Z'),
      });

      await expect(getConsumerProfile('consumer-1')).resolves.toStrictEqual({
        profileName: 'Jane Doe',
        serviceIds: ['serviceA'],
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
      mocks.model.listConsumerIdsWithLoginExpiryDateBefore.mockResolvedValue([
        'expired-1',
      ]);
      mocks.model.deleteConsumers.mockResolvedValue(['expired-1']);

      await unregisterExpiredConsumers(systemTime);

      expect(
        mocks.model.listConsumerIdsWithLoginExpiryDateBefore
      ).toHaveBeenCalledWith(systemTime);
      expect(mocks.model.deleteConsumers).toHaveBeenCalledWith(['expired-1']);
    });

    it('is best effort and still removes consumers when webhook delivery fails', async () => {
      mocks.model.listConsumerIdsWithLoginExpiryDateBefore.mockResolvedValue([
        'expired-1',
      ]);
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
          serviceIds: ['serviceA'],
        },
      ]);

      await batchFetchAndStoreNotifications();

      expect(
        mocks.model.listConsumerIdsWithLoginExpiryDateBefore
      ).not.toHaveBeenCalled();
      expect(
        mocks.tipsAndNotifications.fetchNotificationsAndTipsFromServices
      ).toHaveBeenCalledTimes(1);
      expect(mocks.model.storeNotifications).toHaveBeenCalledTimes(1);
    });
  });

  it('storeNotificationsResponses transforms and stores notifications by service and ignores tips and notifications without datePublished', async () => {
    mocks.model.storeNotifications.mockResolvedValue(undefined);

    const serviceResponses = {
      serviceA: {
        status: 'OK',
        content: {
          notifications: [
            null,
            {
              id: 'n-tip',
              themaID: 'THEMA',
              title: 'Tip',
              isTip: true,
              isAlert: false,
              datePublished: '2026-03-07',
            },
            {
              id: 'n-no-date',
              themaID: 'THEMA',
              title: 'No date',
              isTip: false,
              isAlert: false,
              datePublished: undefined,
            },
            {
              id: 'n-1',
              themaID: 'THEMA',
              title: 'Actual title (should be hidden)',
              isTip: false,
              isAlert: true,
              datePublished: '2026-03-06T00:00:00.000Z',
            },
          ],
        },
      },
      serviceB: {
        status: 'ERROR',
        content: null,
        message: 'failed',
      },
    } as any;

    await storeNotificationsResponses('123456789', serviceResponses);

    expect(mocks.model.storeNotifications).toHaveBeenCalledTimes(1);

    const [profileIdArg, servicesArg, lastLoginDateArg] = mocks.model
      .storeNotifications.mock.calls[0] as unknown as [string, any[], any];

    expect(profileIdArg).toBe('123456789');
    expect(servicesArg).toHaveLength(1);
    expect(lastLoginDateArg).toBeNull();

    expect(servicesArg[0]).toStrictEqual({
      serviceId: 'serviceA',
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

    await storeNotificationsResponses('123456789', {
      serviceA: {
        status: 'ERROR',
        content: null,
        message: 'nope',
      },
    } as any);

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
        serviceA: {
          status: 'OK',
          content: { notifications: [] },
        },
      } as any,
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
        serviceA: {
          status: 'OK',
          content: { notifications: [] },
        },
        belasting: {
          status: 'OK',
          content: { notifications: [] },
        },
      } as any,
      { updateLastLoginDate: true }
    );

    expect(mocks.model.storeNotifications).toHaveBeenCalledWith(
      '123456789',
      [
        {
          serviceId: 'serviceA',
          dateUpdated: systemTime.toISOString(),
          status: 'OK',
          content: [],
        },
      ],
      systemTime
    );
  });
});
