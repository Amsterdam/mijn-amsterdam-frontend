import { describe, it, expect, vi, Mock } from 'vitest';

import { forTesting } from './adoptable-trash-containers';
import { fetchAdoptableTrashContainers } from './adoptable-trash-containers';
import { fetchBRP } from './brp';
import { fetchDataset } from './buurt/buurt';
import { fetchMyLocation } from './home';
import {
  generateRandomPoints,
  getAuthProfileAndToken,
} from '../../testing/utils';
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
} from '../../universal/config/myarea-datasets';
import { apiSuccessResult, apiErrorResult } from '../../universal/helpers/api';

vi.mock('./brp', () => ({
  fetchBRP: vi.fn(),
}));

vi.mock('./home', () => ({
  fetchMyLocation: vi.fn(),
}));

vi.mock('./buurt/buurt', () => ({
  fetchDataset: vi.fn(),
}));

describe('fetchAdoptableTrashContainers', () => {
  const requestID = 'test-request-id';
  const authProfileAndToken = getAuthProfileAndToken();

  it('should return tips if all fetches are successful and age is above LATE_TEEN_AGE', async () => {
    (fetchBRP as Mock).mockResolvedValue(
      apiSuccessResult({ persoon: { geboortedatum: '2000-01-01' } })
    );
    (fetchMyLocation as Mock).mockResolvedValue(
      apiSuccessResult([{ latlng: { lat: DEFAULT_LAT, lng: DEFAULT_LNG } }])
    );
    const [c] = generateRandomPoints(
      { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
      90, // 90 meters
      1
    );
    (fetchDataset as Mock).mockResolvedValue(
      apiSuccessResult({
        features: [
          {
            geometry: { coordinates: [c.lng, c.lat] },
            properties: {
              datasetId: 'afvalcontainers',
              geadopteerd_ind: 'Nee',
            },
          },
        ],
      })
    );

    const result = await fetchAdoptableTrashContainers(
      requestID,
      authProfileAndToken
    );
    expect(result.status).toBe('OK');
    expect(result.content?.tips).toHaveLength(1);
  });

  it('should return an error if fetching BRP data fails', async () => {
    (fetchBRP as Mock).mockResolvedValue(
      apiErrorResult('Error fetching BRP data', null)
    );

    const result = await fetchAdoptableTrashContainers(
      requestID,
      authProfileAndToken
    );
    expect(result.status).toBe('ERROR');
  });

  it('should return an error if fetching location fails', async () => {
    (fetchBRP as Mock).mockResolvedValue(
      apiSuccessResult({ persoon: { geboortedatum: '2000-01-01' } })
    );
    (fetchMyLocation as Mock).mockResolvedValue(
      apiErrorResult('Error fetching BAG location', null)
    );

    const result = await fetchAdoptableTrashContainers(
      requestID,
      authProfileAndToken
    );
    expect(result.status).toBe('ERROR');
  });

  it('should return an error if fetching dataset fails', async () => {
    (fetchBRP as Mock).mockResolvedValue(
      apiSuccessResult({ persoon: { geboortedatum: '2000-01-01' } })
    );
    (fetchMyLocation as Mock).mockResolvedValue(
      apiSuccessResult([{ latlng: { lat: DEFAULT_LAT, lng: DEFAULT_LNG } }])
    );
    (fetchDataset as Mock).mockResolvedValue(
      apiErrorResult('Error fetching Map locations dataset', null)
    );

    const result = await fetchAdoptableTrashContainers(
      requestID,
      authProfileAndToken
    );
    expect(result.status).toBe('ERROR');
  });

  it('should return no tips if age is less than LATE_TEEN_AGE', async () => {
    (fetchBRP as Mock).mockResolvedValue(
      apiSuccessResult({ persoon: { geboortedatum: '2010-01-01' } })
    );

    const result = await fetchAdoptableTrashContainers(
      requestID,
      authProfileAndToken
    );
    expect(result.status).toBe('OK');
    expect(result.content?.tips).toHaveLength(0);
  });

  it('should return no tips if filteredFeatures length is 0', async () => {
    (fetchBRP as Mock).mockResolvedValue(
      apiSuccessResult({ persoon: { geboortedatum: '2000-01-01' } })
    );
    // Make lat away from center
    const lat = DEFAULT_LAT + 1;
    (fetchMyLocation as Mock).mockResolvedValue(
      apiSuccessResult([{ latlng: { lat, lng: DEFAULT_LNG } }])
    );
    const [c] = generateRandomPoints(
      { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
      90, // 90 meters
      1
    );
    (fetchDataset as Mock).mockResolvedValue(
      apiSuccessResult({
        features: [
          {
            geometry: { coordinates: [c.lng, c.lat] },
            properties: {
              datasetId: 'afvalcontainers',
              geadopteerd_ind: 'Nee',
            },
          },
        ],
      })
    );

    const result = await fetchAdoptableTrashContainers(
      requestID,
      authProfileAndToken
    );
    expect(result.status).toBe('OK');
    expect(result.content?.tips).toHaveLength(0);
  });
});

describe('determineDescriptionText Tests', () => {
  test('Returns adults text when adult', () => {
    const age = 18;
    const result = forTesting.determineDescriptionText(age);
    expect(result).toMatchInlineSnapshot(`
      "Help mee om uw eigen buurt schoon te houden en adopteer een afvalcontainer.
       Liever op een andere manier bijdragen? Leen dan een afvalgrijper!"
    `);
  });

  test('Returns more youthly aimed text when person is below 18', () => {
    const age = 16;
    const result = forTesting.determineDescriptionText(age);
    expect(result).toMatchInlineSnapshot(`
      "Help mee om je eigen buurt schoon te houden en adopteer een afvalcontainer.
       Wil je liever iets anders doen? Leen dan een afvalgrijper!"
    `);
  });
});
