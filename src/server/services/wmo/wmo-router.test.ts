import type { Request, Response } from 'express';
import type { MockInstance } from 'vitest';
import { describe, expect, vi, beforeEach } from 'vitest';

import { forTesting } from './wmo-router.ts';
import * as wmoApiService from './wmo-voorzieningen-api-service.ts';
import { apiErrorResult } from '../../../universal/helpers/api.ts';

const { handleVoorzieningenRequest } = forTesting;

describe('handleVoorzieningenRequest', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let fetchMaApiVoorzieningen: MockInstance;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };

    fetchMaApiVoorzieningen = vi.spyOn(
      wmoApiService,
      'fetchMaApiVoorzieningen'
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should return bad request for invalid input', async () => {
    req.body = { bsn: '1x2x3x4x5' };

    await handleVoorzieningenRequest(req as Request, res as Response);

    expect(res.send).toHaveBeenCalledWith({
      code: 400,
      content: null,
      message: `Bad request: for property 'bsn' with error 'Invalid BSN'`,
      status: 'ERROR',
    });
  });

  test('should call fetchMaApiVoorzieningen with correct parameters for valid input', async () => {
    req.body = { bsn: '123456782' };
    const mockResponse = { data: 'mocked data' };
    fetchMaApiVoorzieningen.mockResolvedValue(mockResponse);

    await handleVoorzieningenRequest(req as Request, res as Response);

    expect(fetchMaApiVoorzieningen).toHaveBeenCalledWith(
      '123456782',
      undefined
    );

    expect(res.send).toHaveBeenCalledWith(mockResponse);
  });

  test('should call fetchMaApiVoorzieningen with options when provided', async () => {
    req.body = {
      bsn: '123456782',
      maActies: ['reparatieverzoek'],
      maProductgroep: ['een-naam'],
    };
    const mockResponse = { data: 'mocked data' };
    fetchMaApiVoorzieningen.mockResolvedValueOnce(mockResponse);

    await handleVoorzieningenRequest(req as Request, res as Response);
    expect(res.send).toHaveBeenCalledWith({
      code: 400,
      content: null,
      message: expect.stringContaining('Bad request'),
      status: 'ERROR',
    });

    expect(fetchMaApiVoorzieningen).not.toHaveBeenCalled();
  });

  test('should call fetchMaApiVoorzieningen with options when only maActies is provided', async () => {
    req.body = {
      bsn: '123456782',
      maActies: ['reparatieverzoek'],
    };
    const mockResponse = { data: 'mocked data' };
    fetchMaApiVoorzieningen.mockResolvedValueOnce(mockResponse);

    await handleVoorzieningenRequest(req as Request, res as Response);

    expect(fetchMaApiVoorzieningen).toHaveBeenCalledWith('123456782', {
      maActies: ['reparatieverzoek'],
    });
  });

  test('should return error response if fetchMaApiVoorzieningen responds with an error', async () => {
    req.body = { bsn: '123456782' };
    fetchMaApiVoorzieningen.mockResolvedValueOnce(
      apiErrorResult('Something went wrong', null, 500)
    );

    await handleVoorzieningenRequest(req as Request, res as Response);

    expect(res.send).toHaveBeenCalledWith({
      code: 500,
      content: null,
      message: 'Something went wrong',
      status: 'ERROR',
    });
  });
});
