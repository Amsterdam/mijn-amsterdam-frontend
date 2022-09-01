import { renderRecoilHook } from '../../utils/renderRecoilHook';
import { useMapLocations } from './MyArea.hooks';
import * as reactMaps from '@amsterdam/react-maps';
import { appStateAtom } from '../../hooks';

const mapInstanceMock = {
  setView: jest.fn(),
} as unknown as L.Map;

jest.mock('@amsterdam/react-maps');
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as object),
  useHistory: () => {
    return { location: { pathname: '/', search: '' } };
  },
}));

describe('MyArea.hooks', () => {
  jest.spyOn(reactMaps, 'useMapInstance').mockImplementation(() => {
    return mapInstanceMock;
  });

  describe('useMapLocations', () => {
    it('By default return location', () => {
      const { result } = renderRecoilHook(() => {
        return useMapLocations();
      });

      expect(result.current).toMatchInlineSnapshot(`
        Object {
          "customLocationMarker": Object {
            "label": "Amsterdam centrum",
            "latlng": Object {
              "lat": 52.3717228,
              "lng": 4.8927377,
            },
            "type": "default",
          },
          "homeLocationMarker": null,
          "mapCenter": Object {
            "lat": 52.3717228,
            "lng": 4.8927377,
          },
          "mapZoom": 12,
          "secondaryLocationMarkers": Array [],
        }
      `);

      expect(mapInstanceMock.setView).not.toHaveBeenCalled();
    });

    it('Returns a passed locaton', () => {
      const { result } = renderRecoilHook(() => {
        return useMapLocations(
          mapInstanceMock,
          {
            type: 'home',
            latlng: { lat: 9988, lng: 6677 },
            label: 'Home',
          },
          10
        );
      });

      expect(result.current).toMatchInlineSnapshot(`
        Object {
          "customLocationMarker": Object {
            "label": "Home",
            "latlng": Object {
              "lat": 9988,
              "lng": 6677,
            },
            "type": "custom",
          },
          "homeLocationMarker": null,
          "mapCenter": Object {
            "lat": 9988,
            "lng": 6677,
          },
          "mapZoom": 10,
          "secondaryLocationMarkers": Array [],
        }
      `);

      expect(mapInstanceMock.setView).toHaveBeenCalled();
    });

    it('Returns locations fed by AppState', () => {
      const { result } = renderRecoilHook(
        () => {
          return useMapLocations(mapInstanceMock);
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
        Object {
          "customLocationMarker": Object {
            "label": "Amsterdam centrum",
            "latlng": Object {
              "lat": 52.3717228,
              "lng": 4.8927377,
            },
            "type": "default",
          },
          "homeLocationMarker": Object {
            "label": "Amstel 1
         Amsterdam",
            "latlng": Object {
              "lat": 123,
              "lng": 456,
            },
            "type": "home",
          },
          "mapCenter": Object {
            "lat": 52.3717228,
            "lng": 4.8927377,
          },
          "mapZoom": 12,
          "secondaryLocationMarkers": Array [
            Object {
              "label": "Cenraal stationstraat 999
         Amsterdam",
              "latlng": Object {
                "lat": 678,
                "lng": 901,
              },
              "type": "secondary",
            },
          ],
        }
      `);

      expect(mapInstanceMock.setView).toHaveBeenCalledWith(
        { lat: 123, lng: 456 },
        12
      );
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
        Object {
          "customLocationMarker": Object {
            "label": "Amsterdam centrum",
            "latlng": Object {
              "lat": 52.3717228,
              "lng": 4.8927377,
            },
            "type": "default",
          },
          "homeLocationMarker": Object {
            "label": "Cenraal stationstraat 999
         Amsterdam",
            "latlng": Object {
              "lat": 678,
              "lng": 901,
            },
            "type": "home",
          },
          "mapCenter": Object {
            "lat": 52.3717228,
            "lng": 4.8927377,
          },
          "mapZoom": 12,
          "secondaryLocationMarkers": Array [],
        }
      `);

      expect(mapInstanceMock.setView).not.toHaveBeenCalledWith();
    });
  });
});
