import { describe, it, expect, vi, Mock } from 'vitest';

import { forTesting } from './adoptable-trash-containers';
import { fetchAdoptableTrashContainers } from './adoptable-trash-containers';
import { getAuthProfileAndToken } from '../../../testing/utils';
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
} from '../../../universal/config/myarea-datasets';
import {
  apiSuccessResult,
  apiErrorResult,
} from '../../../universal/helpers/api';
import { fetchMyLocations } from '../bag/my-locations';
import { fetchBrp } from '../brp/brp';
import { fetchDataset } from '../buurt/buurt';

vi.mock('../brp/brp', () => ({
  fetchBrpV2: vi.fn(),
}));

vi.mock('../bag/my-locations', () => ({
  fetchMyLocation: vi.fn(),
}));

vi.mock('../buurt/buurt', () => ({
  fetchDataset: vi.fn(),
}));

describe('fetchAdoptableTrashContainers', () => {
  const authProfileAndToken = getAuthProfileAndToken();
  const defaultLatLng = { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
  const locationApiResponse = apiSuccessResult([{ latlng: defaultLatLng }]);
  const brpApiResponse = apiSuccessResult({
    persoon: { geboortedatum: '2000-01-01' },
  });

  it('should return tips if all fetches are successful and age is above LATE_TEEN_AGE', async () => {
    (fetchBrp as Mock).mockResolvedValue(brpApiResponse);
    (fetchMyLocations as Mock).mockResolvedValue(locationApiResponse);

    const DISTANCE_ADDED = 0.0001;
    const coord = {
      lat: DEFAULT_LAT + DISTANCE_ADDED,
      lng: DEFAULT_LNG + DISTANCE_ADDED,
    };

    (fetchDataset as Mock).mockResolvedValue(
      apiSuccessResult({
        features: [
          {
            geometry: { coordinates: [coord.lng, coord.lat] },
            properties: {
              datasetId: 'afvalcontainers',
              geadopteerd_ind: 'Nee',
            },
          },
        ],
      })
    );

    const result = await fetchAdoptableTrashContainers(authProfileAndToken);
    expect(result.status).toBe('OK');
    expect(result.content?.tips).toHaveLength(1);
  });

  it('should return an error if fetching BRP data fails', async () => {
    (fetchBrp as Mock).mockResolvedValue(
      apiErrorResult('Error fetching BRP data', null)
    );

    const result = await fetchAdoptableTrashContainers(authProfileAndToken);
    expect(result.status).toBe('DEPENDENCY_ERROR');
  });

  it('should return an error if fetching location fails', async () => {
    (fetchBrp as Mock).mockResolvedValue(brpApiResponse);
    (fetchMyLocations as Mock).mockResolvedValue(
      apiErrorResult('Error fetching BAG location', null)
    );

    const result = await fetchAdoptableTrashContainers(authProfileAndToken);
    expect(result.status).toBe('DEPENDENCY_ERROR');
  });

  it('should return an error if fetching dataset fails', async () => {
    (fetchBrp as Mock).mockResolvedValue(brpApiResponse);
    (fetchMyLocations as Mock).mockResolvedValue(locationApiResponse);
    (fetchDataset as Mock).mockResolvedValue(
      apiErrorResult('Error fetching Map locations dataset', null)
    );

    const result = await fetchAdoptableTrashContainers(authProfileAndToken);
    expect(result.status).toBe('DEPENDENCY_ERROR');
  });

  it('should return no tips if age is less than LATE_TEEN_AGE', async () => {
    (fetchBrp as Mock).mockResolvedValue(
      apiSuccessResult({ persoon: { geboortedatum: '2010-01-01' } })
    );

    const result = await fetchAdoptableTrashContainers(authProfileAndToken);
    expect(result.status).toBe('OK');
    expect(result.content?.tips).toHaveLength(0);
  });

  it('should not return tips if there are no adoptable trashcontainers found within the given radius', async () => {
    (fetchBrp as Mock).mockResolvedValue(brpApiResponse);
    (fetchMyLocations as Mock).mockResolvedValue(locationApiResponse);

    // A coord outside of the radius from the Home location returned by fetchMyLocation
    const COORD_LAT_OFFSET = 5;
    const coordinates = [DEFAULT_LNG, DEFAULT_LAT + COORD_LAT_OFFSET];

    (fetchDataset as Mock).mockResolvedValue(
      apiSuccessResult({
        features: [
          {
            geometry: { coordinates },
            properties: {
              datasetId: 'afvalcontainers',
              geadopteerd_ind: 'Nee',
            },
          },
        ],
      })
    );

    const result = await fetchAdoptableTrashContainers(authProfileAndToken);
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
