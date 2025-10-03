import { Request, Response } from 'express';
import { describe, it, expect, vi, beforeEach, MockInstance } from 'vitest';

import * as wmo from './wmo';
import { forTesting } from './wmo-router-external-consumer';
import * as routingHelpers from '../../routing/route-helpers';

const { handleVoorzieningenRequest } = forTesting;

describe('handleVoorzieningenRequest', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let sendResponse: MockInstance;
  let sendBadRequest: MockInstance;
  let fetchWmoVoorzieningenCompact: MockInstance;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };
    sendResponse = vi.spyOn(routingHelpers, 'sendResponse');
    sendBadRequest = vi.spyOn(routingHelpers, 'sendBadRequest');
    fetchWmoVoorzieningenCompact = vi.spyOn(
      wmo,
      'fetchWmoVoorzieningenCompact'
    );
  });

  it('should return bad request for invalid input', async () => {
    req.body = { bsn: 'invalid-bsn' };

    await handleVoorzieningenRequest(req as Request, res as Response);

    expect(sendBadRequest).toHaveBeenCalledWith(res, 'Invalid BSN');
  });

  it('should call fetchWmoVoorzieningenCompact with correct parameters for valid input', async () => {
    req.body = { bsn: '123456789' };
    const mockResponse = { data: 'mocked data' };
    fetchWmoVoorzieningenCompact.mockResolvedValue(mockResponse);

    await handleVoorzieningenRequest(req as Request, res as Response);

    expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
    expect(fetchWmoVoorzieningenCompact).toHaveBeenCalledWith('123456789', {
      productGroup: ['WRA'],
      filter: expect.any(Function),
    });
  });
});
