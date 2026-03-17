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

import { DISCRETE_GENERIC_MESSAGE } from './amsapp-notifications-service-config';

const mocks = vi.hoisted(() => {
  return {
    model: {
      listProfileIds: vi.fn(),
      upsertConsumer: vi.fn(),
      listProfiles: vi.fn(),
      truncate: vi.fn(),
      deleteConsumer: vi.fn(),
      getProfileByConsumer: vi.fn(),
      storeNotifications: vi.fn(),
    },
    authHelpers: {
      getFakeAuthProfileAndToken: vi.fn(),
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
vi.mock('../../tips-and-notifications', () => mocks.tipsAndNotifications);

import {
  getConsumerProfile,
  storeNotificationsResponses,
  unregisterConsumer,
} from './amsapp-notifications';

describe('amsapp-notifications', () => {
  const systemTime = new Date('2000-01-01T12:00:00.000Z');
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(systemTime);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  describe('Consumer', () => {
    it('unregisterConsumer returns true when at least one row was deleted', async () => {
      mocks.model.deleteConsumer.mockResolvedValue(1);

      await expect(unregisterConsumer('consumer-1')).resolves.toBe(true);
      expect(mocks.model.deleteConsumer).toHaveBeenCalledWith('consumer-1');
    });

    it('unregisterConsumer returns false when no rows were deleted', async () => {
      mocks.model.deleteConsumer.mockResolvedValue(0);

      await expect(unregisterConsumer('consumer-1')).resolves.toBe(false);
    });

    it('getConsumerProfile returns profile data + isRegistered=true when found', async () => {
      mocks.model.getProfileByConsumer.mockResolvedValue({
        profileId: '123456789',
        profileName: 'Jane Doe',
        serviceIds: ['serviceA'],
        dateUpdated: '2026-03-01T00:00:00.000Z',
      });

      await expect(getConsumerProfile('consumer-1')).resolves.toStrictEqual({
        profileId: '123456789',
        profileName: 'Jane Doe',
        serviceIds: ['serviceA'],
        dateUpdated: '2026-03-01T00:00:00.000Z',
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
      systemTime.toISOString()
    );
  });
});
