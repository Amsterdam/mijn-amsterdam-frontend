import * as reactMaps from '@amsterdam/react-maps';
import { describe, expect, it, test, vi } from 'vitest';

import { useMapLocations, useSetMapCenterAtLocation } from './MyArea.hooks.ts';
import { renderRecoilHook } from '../../../testing/render-recoil.hook.tsx';
import { appStateAtom } from '../../hooks/useAppState.ts';

const mapInstanceMock = {
  setView: vi.fn(),
} as unknown as L.Map;

vi.mock('@amsterdam/react-maps');

vi.mock('react-router', async (requireActual) => {
  const origModule: object = await requireActual();
  return {
    ...origModule,
    useLocation: () => {
      return { pathname: '/', search: '' };
    },
  };
});

describe('MyArea.hooks', () => {
  vi.spyOn(reactMaps, 'useMapInstance').mockImplementation(() => {
    return mapInstanceMock;
  });

  describe('useMapLocations', () => {
    it('By default return location', () => {
      const { result } = renderRecoilHook(() => {
        return useMapLocations();
      });

      expect(result.current).toMatchInlineSnapshot(`
        {
          "customLocationMarker": {
            "label": "Amsterdam centrum",
            "latlng": {
              "lat": 52.3676842478192,
              "lng": 4.90022569871861,
            },
            "type": "default",
          },
          "homeLocationMarker": null,
          "mapCenter": {
            "lat": 52.3676842478192,
            "lng": 4.90022569871861,
          },
          "mapZoom": 12,
          "secondaryLocationMarkers": [],
        }
      `);

      expect(mapInstanceMock.setView).not.toHaveBeenCalled();
    });

    it('Returns a passed locaton', () => {
      const { result } = renderRecoilHook(() => {
        return useMapLocations(
          {
            type: 'home',
            latlng: { lat: 9988, lng: 6677 },
            label: 'Home',
          },
          10
        );
      });

      expect(result.current).toMatchInlineSnapshot(`
        {
          "customLocationMarker": {
            "label": "Home",
            "latlng": {
              "lat": 9988,
              "lng": 6677,
            },
            "type": "custom",
          },
          "homeLocationMarker": null,
          "mapCenter": {
            "lat": 9988,
            "lng": 6677,
          },
          "mapZoom": 10,
          "secondaryLocationMarkers": [],
        }
      `);
    });

    it('Returns locations fed by AppState', () => {
      const { result } = renderRecoilHook(
        () => {
          return useMapLocations();
        },
        {
          states: [
            {
              initialValue: {
                MY_LOCATION: {
                  content: [
                    {
                      latlng: { lat: 123, lng: 456 },
                      address: {
                        huisnummer: '1',
                        straatnaam: 'Amstel',
                        woonplaatsNaam: 'Amsterdam',
                      },
                    },
                    {
                      latlng: { lat: 678, lng: 901 },
                      address: {
                        huisnummer: '999',
                        straatnaam: 'Cenraal stationstraat',
                        woonplaatsNaam: 'Amsterdam',
                      },
                    },
                  ],
                },
              },
              recoilState: appStateAtom,
            },
          ],
        }
      );

      expect(result.current).toMatchInlineSnapshot(`
        {
          "customLocationMarker": {
            "label": "Amsterdam centrum",
            "latlng": {
              "lat": 52.3676842478192,
              "lng": 4.90022569871861,
            },
            "type": "default",
          },
          "homeLocationMarker": {
            "label": "Amstel 1
         Amsterdam",
            "latlng": {
              "lat": 123,
              "lng": 456,
            },
            "type": "home",
          },
          "mapCenter": {
            "lat": 52.3676842478192,
            "lng": 4.90022569871861,
          },
          "mapZoom": 12,
          "secondaryLocationMarkers": [
            {
              "label": "Cenraal stationstraat 999
         Amsterdam",
              "latlng": {
                "lat": 678,
                "lng": 901,
              },
              "type": "secondary",
            },
          ],
        }
      `);
    });

    it('Returns primary location fed by AppState', () => {
      const { result } = renderRecoilHook(
        () => {
          return useMapLocations();
        },
        {
          states: [
            {
              initialValue: {
                MY_LOCATION: {
                  content: [
                    {
                      latlng: { lat: 678, lng: 901 },
                      address: {
                        huisnummer: '999',
                        straatnaam: 'Cenraal stationstraat',
                        woonplaatsNaam: 'Amsterdam',
                      },
                    },
                  ],
                },
              },
              recoilState: appStateAtom,
            },
          ],
        }
      );

      expect(result.current).toMatchInlineSnapshot(`
        {
          "customLocationMarker": {
            "label": "Amsterdam centrum",
            "latlng": {
              "lat": 52.3676842478192,
              "lng": 4.90022569871861,
            },
            "type": "default",
          },
          "homeLocationMarker": {
            "label": "Cenraal stationstraat 999
         Amsterdam",
            "latlng": {
              "lat": 678,
              "lng": 901,
            },
            "type": "home",
          },
          "mapCenter": {
            "lat": 52.3676842478192,
            "lng": 4.90022569871861,
          },
          "mapZoom": 12,
          "secondaryLocationMarkers": [],
        }
      `);
    });
  });

  describe('useSetMapCenterAtLocation', () => {
    test('Center around custom location', () => {
      renderRecoilHook(() => {
        return useSetMapCenterAtLocation(
          mapInstanceMock,
          4,
          {
            type: 'custom',
            latlng: {
              lat: 11.11,
              lng: 88.77,
            },
            label: 'Custom location',
          },
          {
            type: 'home',
            latlng: {
              lat: 3.3333,
              lng: 9.9999,
            },
            label: 'Test location home',
          }
        );
      });

      expect(mapInstanceMock.setView).toHaveBeenCalledWith(
        {
          lat: 11.11,
          lng: 88.77,
        },
        4
      );
    });

    test('Center around home location', () => {
      renderRecoilHook(() => {
        return useSetMapCenterAtLocation(
          mapInstanceMock,
          4,
          {
            type: 'default',
            latlng: {
              lat: 11.11,
              lng: 88.77,
            },
            label: 'Custom location defaul',
          },
          {
            type: 'home',
            latlng: {
              lat: 3.3333,
              lng: 9.9999,
            },
            label: 'Test location home',
          }
        );
      });

      expect(mapInstanceMock.setView).toHaveBeenCalledWith(
        {
          lat: 3.3333,
          lng: 9.9999,
        },
        4
      );
    });

    test('Center around custom default location', () => {
      renderRecoilHook(() => {
        return useSetMapCenterAtLocation(
          mapInstanceMock,
          4,
          {
            type: 'default',
            latlng: {
              lat: 11.11,
              lng: 88.77,
            },
            label: 'Custom location defaul',
          },
          null
        );
      });

      expect(mapInstanceMock.setView).toHaveBeenCalledWith(
        {
          lat: 11.11,
          lng: 88.77,
        },
        4
      );
    });
  });
});
