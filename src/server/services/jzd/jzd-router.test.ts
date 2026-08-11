import type { Request, Response } from 'express';
import type { MockInstance } from 'vitest';
import { describe, expect, vi, beforeEach } from 'vitest';

import { forTesting } from '../zorgned-aanvragen-api/zorgned-aanvragen-api-route-handlers.ts';
import * as voorzieningenApiService from '../zorgned-aanvragen-api/zorgned-aanvragen-api-service.ts';
import * as jeugdService from './jeugd/jeugd.ts';
import * as wmoService from './wmo/wmo-zorgned-service.ts';
import { apiErrorResult } from '../../../universal/helpers/api.ts';
import * as hliService from '../hli/hli-zorgned-service.ts';

const { handleVoorzieningenRequest } = forTesting;

describe('handleVoorzieningenRequest', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let fetchMaApiVoorzieningen: MockInstance;
  let fetchZorgnedAanvragenWMO: MockInstance;
  let fetchZorgnedAanvragenJeugd: MockInstance;
  let fetchZorgnedAanvragenHLI: MockInstance;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };

    fetchMaApiVoorzieningen = vi.spyOn(
      voorzieningenApiService,
      'fetchMaApiVoorzieningen'
    );
    fetchZorgnedAanvragenWMO = vi.spyOn(wmoService, 'fetchZorgnedAanvragenWMO');
    fetchZorgnedAanvragenJeugd = vi.spyOn(
      jeugdService,
      'fetchZorgnedAanvragenJeugd'
    );
    fetchZorgnedAanvragenHLI = vi.spyOn(hliService, 'fetchZorgnedAanvragenHLI');

    fetchZorgnedAanvragenWMO.mockResolvedValue({ status: 'OK', content: [] });
    fetchZorgnedAanvragenJeugd.mockResolvedValue({ status: 'OK', content: [] });
    fetchZorgnedAanvragenHLI.mockResolvedValue({ status: 'OK', content: [] });
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
    fetchMaApiVoorzieningen.mockReturnValue(mockResponse);

    await handleVoorzieningenRequest(req as Request, res as Response);

    expect(fetchZorgnedAanvragenWMO).toHaveBeenCalledWith('123456782');
    expect(fetchZorgnedAanvragenJeugd).toHaveBeenCalledWith('123456782');
    expect(fetchZorgnedAanvragenHLI).toHaveBeenCalledWith('123456782');

    expect(fetchMaApiVoorzieningen).toHaveBeenCalledWith(
      [
        { status: 'OK', content: [] },
        { status: 'OK', content: [] },
        { status: 'OK', content: [] },
      ],
      undefined
    );

    expect(res.send).toHaveBeenCalledWith(mockResponse);
  });

  test('should return bad request when invalid option provided', async () => {
    req.body = {
      bsn: '123456782',
      maActies: ['reparatieverzoek'],
      maProductgroep: ['een-naam'],
    };
    const mockResponse = { data: 'mocked data' };
    fetchMaApiVoorzieningen.mockReturnValueOnce(mockResponse);

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
    fetchMaApiVoorzieningen.mockReturnValueOnce(mockResponse);

    await handleVoorzieningenRequest(req as Request, res as Response);

    expect(fetchMaApiVoorzieningen).toHaveBeenCalledWith(
      [
        { status: 'OK', content: [] },
        { status: 'OK', content: [] },
        { status: 'OK', content: [] },
      ],
      {
        maActies: ['reparatieverzoek'],
      }
    );
  });

  test('should return error response if fetchMaApiVoorzieningen responds with an error', async () => {
    req.body = { bsn: '123456782' };
    fetchMaApiVoorzieningen.mockReturnValueOnce(
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
