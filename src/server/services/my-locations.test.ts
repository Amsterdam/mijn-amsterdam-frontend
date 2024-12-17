import { describe, it, expect, vi, Mock } from 'vitest';

import { fetchBAG } from './bag';
import { fetchBRP } from './brp';
import { fetchKVK, getKvkAddresses } from './kvk';
import { fetchMyLocation, forTesting } from './my-locations';
import { getAuthProfileAndToken } from '../../testing/utils';
import { apiSuccessResult, apiErrorResult } from '../../universal/helpers/api';
import { Adres } from '../../universal/types';

vi.mock('./brp', () => ({
  fetchBRP: vi.fn(),
}));

vi.mock('./bag', () => ({
  fetchBAG: vi.fn(),
}));

vi.mock('./kvk', async (importOriginal) => ({
  ...(await importOriginal()),
  getKvkAddresses: vi.fn(),
  fetchKVK: vi.fn(),
}));

const adres = { straatnaam: 'address1' } as Adres;
const adres2 = { straatnaam: 'address1' } as Adres;

describe('fetchPrivate', () => {
  const requestID = 'test-request-id';
  const authProfileAndToken = getAuthProfileAndToken();

  it('should return private addresses if fetching BRP data is successful', async () => {
    (fetchBRP as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        mokum: true,
        adres,
      })
    );

    (fetchBAG as Mock).mockResolvedValueOnce(
      apiSuccessResult({ latlng: { lat: 1, lng: 1 }, address: 'Een adres' })
    );

    const result = await forTesting.fetchPrivate(
      requestID,
      authProfileAndToken
    );

    expect(fetchBAG).toHaveBeenCalledWith(requestID, adres);

    expect(result.status).toBe('OK');
    expect(result.content).toHaveLength(1);
    expect(result.content).toEqual([
      {
        address: 'Een adres',
        latlng: {
          lat: 1,
          lng: 1,
        },
        profileType: 'private',
      },
    ]);
  });

  it('should return default location if no BAG location is found', async () => {
    (fetchBRP as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        mokum: true,
        adres,
      })
    );

    (fetchBAG as Mock).mockResolvedValueOnce(
      apiSuccessResult({ latlng: null, address: null })
    );

    const result = await forTesting.fetchPrivate(
      requestID,
      authProfileAndToken
    );

    expect(result).toStrictEqual({
      content: [
        {
          address: null,
          latlng: {
            lat: 52.3676842478192,
            lng: 4.90022569871861,
          },
          profileType: 'private',
        },
      ],
      status: 'OK',
    });
  });

  it('should return a bare response if BRP data is not a Mokum address', async () => {
    (fetchBRP as Mock).mockResolvedValueOnce(
      apiSuccessResult({ mokum: false, adres: null })
    );

    const result = await forTesting.fetchPrivate(
      requestID,
      authProfileAndToken
    );

    expect(result.status).toBe('OK');
    expect(result.content).toHaveLength(1);
    expect(result.content).toEqual([
      {
        address: null,
        latlng: null,
        profileType: 'private',
      },
    ]);
  });

  it('should return an error if fetching BRP data fails', async () => {
    (fetchBRP as Mock).mockResolvedValueOnce(
      apiErrorResult('Error fetching BRP data', null)
    );

    const result = await forTesting.fetchPrivate(
      requestID,
      authProfileAndToken
    );
    expect(result.status === 'DEPENDENCY_ERROR' && result.message).toBe(
      '[BRP] Error fetching BRP data'
    );
  });
});

describe('fetchCommercial', () => {
  const requestID = 'test-request-id';
  const authProfileAndToken = getAuthProfileAndToken('commercial');

  it('should return commercial addresses if fetching KVK data is successful', async () => {
    (fetchKVK as Mock).mockResolvedValueOnce(
      apiSuccessResult({ vestigingen: [adres, adres2] })
    );

    (getKvkAddresses as Mock).mockReturnValueOnce([adres, adres2]);

    (fetchBAG as Mock).mockResolvedValueOnce(
      apiSuccessResult({ latlng: { lat: 1, lng: 1 }, address: 'Een adres' })
    );
    (fetchBAG as Mock).mockResolvedValueOnce(
      apiSuccessResult({ latlng: { lat: 1, lng: 1 }, address: 'Een 2e adres' })
    );

    const result = await forTesting.fetchCommercial(
      requestID,
      authProfileAndToken
    );

    expect(fetchBAG).toHaveBeenCalledWith(requestID, adres);
    expect(fetchBAG).toHaveBeenCalledWith(requestID, adres2);

    expect(result).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "address": "Een adres",
            "latlng": {
              "lat": 1,
              "lng": 1,
            },
            "profileType": "commercial",
          },
          {
            "address": "Een 2e adres",
            "latlng": {
              "lat": 1,
              "lng": 1,
            },
            "profileType": "commercial",
          },
        ],
        "status": "OK",
      }
    `);
  });

  it('should return an error if fetching KVK data fails', async () => {
    (fetchKVK as Mock).mockResolvedValueOnce(
      apiErrorResult('Error fetching KVK data', null)
    );

    const result = await forTesting.fetchCommercial(
      requestID,
      authProfileAndToken
    );
    expect(result.status).toBe('DEPENDENCY_ERROR');
  });
});

describe('fetchMyLocation', () => {
  const requestID = 'test-request-id';
  const authProfileAndTokenPrivate = getAuthProfileAndToken();
  const authProfileAndTokenCommercial = getAuthProfileAndToken('commercial');

  it('should return locations if fetching commercial and private data is successful', async () => {
    (fetchBRP as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        mokum: true,
        adres,
      })
    );

    (fetchBAG as Mock).mockResolvedValueOnce(
      apiSuccessResult({ latlng: { lat: 1, lng: 1 }, address: 'Een adres' })
    );

    (fetchBAG as Mock).mockResolvedValueOnce(
      apiSuccessResult({ latlng: { lat: 2, lng: 2 }, address: 'Een 2e adres' })
    );

    (fetchKVK as Mock).mockResolvedValueOnce(
      apiSuccessResult({ vestigingen: [adres2] })
    );

    (getKvkAddresses as Mock).mockReturnValueOnce([adres2]);

    const result = await fetchMyLocation(requestID, authProfileAndTokenPrivate);
    expect(result).toEqual({
      content: [
        {
          address: 'Een 2e adres',
          latlng: {
            lat: 2,
            lng: 2,
          },
          profileType: 'private',
        },
        {
          address: 'Een adres',
          latlng: {
            lat: 1,
            lng: 1,
          },
          profileType: 'commercial',
        },
      ],
      status: 'OK',
    });
  });

  it('should return commercial locations if profile type is commercial', async () => {
    (fetchBAG as Mock).mockResolvedValueOnce(
      apiSuccessResult({ latlng: { lat: 2, lng: 2 }, address: 'Een 2e adres' })
    );

    (fetchKVK as Mock).mockResolvedValueOnce(
      apiSuccessResult({ vestigingen: [adres2] })
    );

    (getKvkAddresses as Mock).mockReturnValueOnce([adres2]);

    const result = await fetchMyLocation(
      requestID,
      authProfileAndTokenCommercial
    );
    expect(result.status).toBe('OK');
    expect(result.content).toHaveLength(1);
  });

  it('should return an error if fetching commercial data fails', async () => {
    (fetchKVK as Mock).mockResolvedValueOnce(
      apiErrorResult('Server down', null)
    );

    const result = await fetchMyLocation(
      requestID,
      authProfileAndTokenCommercial
    );
    expect(result.status).toBe('DEPENDENCY_ERROR');
  });

  it('should return an error if no locations found', async () => {
    (fetchKVK as Mock).mockResolvedValueOnce(
      apiSuccessResult({ vestigingen: [] })
    );
    (getKvkAddresses as Mock).mockReturnValueOnce([]);
    (fetchBRP as Mock).mockResolvedValueOnce(apiErrorResult('mwa', null));

    const result = await fetchMyLocation(requestID, authProfileAndTokenPrivate);
    expect(result).toEqual({
      content: null,
      message: 'Could not fetch locations.',
      status: 'ERROR',
    });
  });
});
