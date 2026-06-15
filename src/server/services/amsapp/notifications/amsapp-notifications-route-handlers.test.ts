import { HttpStatusCode } from 'axios';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as model from './amsapp-notifications-model.ts';
import {
  fetchAndStoreNotifications,
  handleConsumerRegistrationProfile,
  handleSendNotificationsResponse,
  handleUnregisterConsumer,
} from './amsapp-notifications-route-handlers.ts';
import * as notifications from './amsapp-notifications.ts';
import { RequestMock, ResponseMock } from '../../../../testing/utils.ts';

describe('amsapp notifications route handlers', () => {
  let res: ReturnType<typeof ResponseMock.new>;

  beforeEach(() => {
    res = ResponseMock.new();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('handleUnregisterConsumer returns success when consumer was deleted', async () => {
    const unregisterConsumers = vi.spyOn(notifications, 'unregisterConsumers');
    const reqMock = RequestMock.new()
      .setParams({ consumerId: 'consumer-1' })
      .get<{ consumerId: string }>();
    unregisterConsumers.mockResolvedValue(['consumer-1']);

    await handleUnregisterConsumer(reqMock, res);

    expect(res.send).toHaveBeenCalledWith({
      content: 'Consumers deleted',
      status: 'OK',
    });
  });

  test('handleUnregisterConsumer returns not found when consumer was not deleted', async () => {
    const unregisterConsumers = vi.spyOn(notifications, 'unregisterConsumers');
    const reqMock = RequestMock.new()
      .setParams({ consumerId: 'consumer-1' })
      .get<{ consumerId: string }>();
    unregisterConsumers.mockResolvedValue([]);

    await handleUnregisterConsumer(reqMock, res);

    expect(res.send).toHaveBeenCalledWith({
      message: 'Not Modified',
      content: null,
      status: 'ERROR',
      code: HttpStatusCode.NotModified,
    });
  });

  test('handleConsumerRegistrationProfile returns isRegistered false when profile lookup returns null', async () => {
    const getConsumerProfile = vi.spyOn(notifications, 'getConsumerProfile');
    getConsumerProfile.mockResolvedValue({ isRegistered: false });

    const reqMock = RequestMock.new()
      .setParams({ consumerId: 'consumer-1' })
      .get<{ consumerId: string }>();

    await handleConsumerRegistrationProfile(reqMock, res);

    expect(res.send).toHaveBeenCalledWith({
      content: { isRegistered: false },
      status: 'OK',
    });
  });

  test('fetchAndStoreNotifications triggers background fetch and returns success immediately', () => {
    const batchFetchAndStoreNotifications = vi.spyOn(
      notifications,
      'batchFetchAndStoreNotifications'
    );
    const pendingPromise = new Promise<void>(() => undefined);
    batchFetchAndStoreNotifications.mockReturnValue(pendingPromise);

    fetchAndStoreNotifications(RequestMock.new().get(), res);

    expect(batchFetchAndStoreNotifications).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      content: 'success',
      status: 'OK',
    });
  });

  test('returns 400 on invalid limit', async () => {
    const batchFetchNotifications = vi.spyOn(
      notifications,
      'batchFetchNotifications'
    );
    batchFetchNotifications.mockResolvedValue([]);

    const reqMock = RequestMock.new<{
      dateFrom: string;
      offset: string;
      limit: string;
    }>().setQuery({
      limit: 'foo',
    });

    await handleSendNotificationsResponse(reqMock, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
    expect(res.send).toHaveBeenCalled();
    expect(batchFetchNotifications).not.toHaveBeenCalled();
  });

  test('returns 400 on negative offset', async () => {
    const batchFetchNotifications = vi.spyOn(
      notifications,
      'batchFetchNotifications'
    );
    batchFetchNotifications.mockResolvedValue([]);

    const reqMock = RequestMock.new<{
      dateFrom: string;
      offset: string;
      limit: string;
    }>().setQuery({
      offset: '-1',
    });

    await handleSendNotificationsResponse(reqMock, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
    expect(batchFetchNotifications).not.toHaveBeenCalled();
  });

  test('returns 400 on invalid dateFrom', async () => {
    const batchFetchNotifications = vi.spyOn(
      notifications,
      'batchFetchNotifications'
    );
    batchFetchNotifications.mockResolvedValue([]);

    const reqMock = RequestMock.new<{
      dateFrom: string;
      offset: string;
      limit: string;
    }>().setQuery({
      dateFrom: 'not-a-date',
    });

    await handleSendNotificationsResponse(reqMock, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
    expect(batchFetchNotifications).not.toHaveBeenCalled();
  });

  test('parses offset/limit as numbers and forwards them as isostring and numbers', async () => {
    const getProfilesCount = vi.spyOn(model, 'getProfilesCount');
    const batchFetchNotifications = vi.spyOn(
      notifications,
      'batchFetchNotifications'
    );
    getProfilesCount.mockResolvedValue(0);
    batchFetchNotifications.mockResolvedValue([]);

    const reqMock = RequestMock.new<{
      dateFrom: string;
      offset: string;
      limit: string;
    }>().setQuery({
      dateFrom: '2026-03-01T00:00:00.000Z',
      offset: '10',
      limit: '25',
    });

    await handleSendNotificationsResponse(reqMock, res);

    expect(getProfilesCount).toHaveBeenCalledWith({
      dateFrom: '2026-03-01T00:00:00.000Z',
    });
    expect(batchFetchNotifications).toHaveBeenCalledWith({
      dateFrom: '2026-03-01T00:00:00.000Z',
      offset: 10,
      limit: 25,
    });
  });
});
