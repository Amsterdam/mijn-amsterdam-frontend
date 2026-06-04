/* eslint-disable @typescript-eslint/no-explicit-any */
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
    req.params = { consumerId: 'consumer-1' } as any;
    unregisterConsumers.mockResolvedValue(['consumer-1']);

    await handleUnregisterConsumer(req as any, res);

    expect(unregisterConsumers).toHaveBeenCalledWith(['consumer-1']);
    expect(res.send).toHaveBeenCalledWith({
      content: 'Consumer deleted',
      status: 'OK',
    });
  });

  test('handleUnregisterConsumer returns not found when consumer was not deleted', async () => {
    req.params = { consumerId: 'consumer-1' } as any;
    unregisterConsumers.mockResolvedValue([]);

    await handleUnregisterConsumer(req as any, res);

    expect(res.send).toHaveBeenCalledWith({
      message: 'Not Found',
      content: null,
      status: 'ERROR',
      code: HttpStatusCode.NotFound,
    });
  });

  test('handleConsumerRegistrationProfile returns not found when profile lookup returns null', async () => {
    getConsumerProfile.mockResolvedValue(null);

    req.params = { consumerId: 'consumer-1' } as any;
    await handleConsumerRegistrationProfile(req as any, res);

    expect(res.send).toHaveBeenCalledWith({
      message: 'Not Found',
      content: null,
      status: 'ERROR',
      code: HttpStatusCode.NotFound,
    });
  });

  test('fetchAndStoreNotifications triggers background fetch and returns success immediately', () => {
    const pendingPromise = new Promise<void>(() => undefined);
    batchFetchAndStoreNotifications.mockReturnValue(pendingPromise);

    fetchAndStoreNotifications(req as any, res);

    expect(batchFetchAndStoreNotifications).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      content: 'success',
      status: 'OK',
    });
  });

  test('returns 400 on invalid limit', async () => {
    req.query = { limit: 'foo' } as any;

    await handleSendNotificationsResponse(req as any, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
    expect(res.send).toHaveBeenCalled();
    expect(batchFetchNotifications).not.toHaveBeenCalled();
  });

  test('returns 400 on negative offset', async () => {
    req.query = { offset: '-1' } as any;

    await handleSendNotificationsResponse(req as any, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
    expect(batchFetchNotifications).not.toHaveBeenCalled();
  });

  test('returns 400 on invalid dateFrom', async () => {
    req.query = { dateFrom: 'not-a-date' } as any;

    await handleSendNotificationsResponse(req as any, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
    expect(batchFetchNotifications).not.toHaveBeenCalled();
  });

  test('parses offset/limit as numbers and forwards them as isostring and numbers', async () => {
    req.query = {
      dateFrom: '2026-03-01T00:00:00.000Z',
      offset: 10,
      limit: 25,
    } as any;

    await handleSendNotificationsResponse(req as any, res);

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
