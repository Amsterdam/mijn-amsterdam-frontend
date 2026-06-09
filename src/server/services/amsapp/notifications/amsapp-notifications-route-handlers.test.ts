import { HttpStatusCode } from 'axios';
import type { Request } from 'express';
import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type MockInstance,
} from 'vitest';

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
  let req: Request;
  let res: ReturnType<typeof ResponseMock.new>;
  let batchFetchNotifications: MockInstance;
  let batchFetchAndStoreNotifications: MockInstance;
  let getProfileByConsumer: MockInstance;
  let getConsumerProfile: MockInstance;
  let unregisterConsumers: MockInstance;
  let getProfilesCount: MockInstance;

  beforeEach(() => {
    req = RequestMock.new().get();
    res = ResponseMock.new();

    batchFetchNotifications = vi.spyOn(
      notifications,
      'batchFetchNotifications'
    );
    batchFetchAndStoreNotifications = vi.spyOn(
      notifications,
      'batchFetchAndStoreNotifications'
    );
    getProfileByConsumer = vi.spyOn(model, 'getProfileByConsumer');
    getConsumerProfile = vi.spyOn(notifications, 'getConsumerProfile');
    unregisterConsumers = vi.spyOn(notifications, 'unregisterConsumers');
    getProfilesCount = vi.spyOn(model, 'getProfilesCount');

    batchFetchNotifications.mockResolvedValue([]);
    batchFetchAndStoreNotifications.mockResolvedValue(undefined);
    getConsumerProfile.mockResolvedValue({ isRegistered: false });
    unregisterConsumers.mockResolvedValue([]);
    getProfilesCount.mockResolvedValue(0);
  });

  test('handleUnregisterConsumer returns success when consumer was deleted', async () => {
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
    getProfileByConsumer.mockResolvedValue(null);

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
    const pendingPromise = new Promise<void>(() => undefined);
    batchFetchAndStoreNotifications.mockReturnValue(pendingPromise);

    fetchAndStoreNotifications(req, res);

    expect(batchFetchAndStoreNotifications).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      content: 'success',
      status: 'OK',
    });
  });

  test('returns 400 on invalid limit', async () => {
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
