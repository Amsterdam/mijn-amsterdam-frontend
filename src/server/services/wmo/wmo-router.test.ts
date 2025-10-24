import { Request, Response } from 'express';
import { describe, expect, vi, beforeEach, MockInstance } from 'vitest';

import * as wmo from './wmo';
import { forTesting } from './wmo-router';

const { handleVoorzieningenRequest } = forTesting;

describe('handleVoorzieningenRequest', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let fetchActueleWRAVoorzieningenCompact: MockInstance;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };

    fetchActueleWRAVoorzieningenCompact = vi.spyOn(
      wmo,
      'fetchActueleWRAVoorzieningenCompact'
    );
  });

  test('should return bad request for invalid input', async () => {
    req.body = { bsn: '1x2x3x4x5' };

    await handleVoorzieningenRequest(req as Request, res as Response);

    expect(res.send).toHaveBeenCalledWith({
      code: 400,
      content: null,
      message: 'Bad request: bsn Invalid BSN',
      status: 'ERROR',
    });
  });

  test('should call fetchWmoVoorzieningenCompact with correct parameters for valid input', async () => {
    req.body = { bsn: '123456782' };
    const mockResponse = { data: 'mocked data' };
    fetchActueleWRAVoorzieningenCompact.mockResolvedValue(mockResponse);

    await handleVoorzieningenRequest(req as Request, res as Response);

    expect(fetchActueleWRAVoorzieningenCompact).toHaveBeenCalledWith(
      '123456782'
    );

    expect(res.send).toHaveBeenCalledWith(mockResponse);
  });
});
