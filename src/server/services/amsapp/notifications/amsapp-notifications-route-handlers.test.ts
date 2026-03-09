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

import * as notifications from './amsapp-notifications';
import * as model from './amsapp-notifications-model';
import { handleSendNotificationsResponse } from './amsapp-notifications-route-handlers';
import { RequestMock, ResponseMock } from '../../../../testing/utils';

describe('amsapp notifications route handlers', () => {
  let req: Request;
  let res: ReturnType<typeof ResponseMock.new>;
  let batchFetchNotifications: MockInstance;
  let getProfilesCount: MockInstance;

  beforeEach(() => {
    req = RequestMock.new().get();
    res = ResponseMock.new();

    batchFetchNotifications = vi.spyOn(
      notifications,
      'batchFetchNotifications'
    );
    getProfilesCount = vi.spyOn(model, 'getProfilesCount');

    batchFetchNotifications.mockResolvedValue([]);
    getProfilesCount.mockResolvedValue(0);
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
      offset: '10',
      limit: '25',
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

    const sendArg = res.send.mock.calls[0][0];
    expect(sendArg.meta.offset).toBe(10);
    expect(sendArg.meta.limit).toBe(25);
    expect(sendArg.meta.dateFrom).toBe('2026-03-01T00:00:00.000Z');
  });
});
