import nock from 'nock';

import {
  DatasetConfig,
  fetchMeldingenBuurt,
  transformHardlooproutesResponse,
  transformMeldingenBuurtResponse,
} from './datasets.ts';
import { remoteApiHost } from '../../../testing/setup.ts';

describe('Custom dataset tranformations', () => {
  it('Should group distance of hardlooproute', () => {
    const sourceResponse: any = {
      _embedded: {
        hardlooproute: [
          {
            id: 1,
            lengte: 2.6,
            geometry: { coordinates: [1, 2], type: 'Point' },
          },
          {
            id: 2,
            lengte: 5.5,
            geometry: { coordinates: [1, 2], type: 'Point' },
          },
          {
            id: 3,
            lengte: 9,
            geometry: { coordinates: [1, 2], type: 'Point' },
          },
          {
            id: 4,
            lengte: 11,
            geometry: { coordinates: [1, 2], type: 'Point' },
          },
        ],
      },
    };

    const transformedFeatures = [
      {
        geometry: { coordinates: [1, 2], type: 'Point' },
        properties: {
          lengte: '0-5 km',
          id: '1',
          datasetId: 'hardlooproute',
        },
        type: 'Feature',
      },
      {
        geometry: { coordinates: [1, 2], type: 'Point' },
        properties: {
          lengte: '0-5 km',
          id: '2',
          datasetId: 'hardlooproute',
        },
        type: 'Feature',
      },
      {
        geometry: { coordinates: [1, 2], type: 'Point' },
        properties: {
          lengte: '6-10 km',
          id: '3',
          datasetId: 'hardlooproute',
        },
        type: 'Feature',
      },
      {
        geometry: { coordinates: [1, 2], type: 'Point' },
        properties: {
          lengte: 'Meer dan 10 km',
          id: '4',
          datasetId: 'hardlooproute',
        },
        type: 'Feature',
      },
    ];

    const config: DatasetConfig = {
      featureType: 'Point',
      triesUntilConsiderdStale: 5,
      listUrl: remoteApiHost,
    };

    const result = transformHardlooproutesResponse(
      'hardlooproute',
      config,
      sourceResponse
    );

    expect(result).toStrictEqual(transformedFeatures);
  });

  test('fetchMeldingenBuurt:success', async () => {
    const baseUrl =
      'https://api.meldingen.amsterdam.nl/signals/v1/public/signals';
    const api = nock(baseUrl);
    const url = new URL(
      `${baseUrl}/geography?bbox=4.705770%2C52.256977%2C5.106206%2C52.467268&geopage=1`
    );
    const urlPage1 = url.toString();

    url.searchParams.set('geopage', '2');
    const urlPage2 = url.toString();

    url.searchParams.set('geopage', '3');
    const urlPage3 = url.toString();

    for (const url of [urlPage1, urlPage2, urlPage3]) {
      const page = parseInt(url.slice(-1), 10);
      const path = url.replace(baseUrl, '');

      api.get(path).reply(
        200,
        {
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [4.70881306808498, 52.2612733394801],
              },
              properties: {
                category: {
                  name: 'Feature ' + page,
                  slug: 'feature-' + page,
                  parent: {
                    name: 'AllFeatures',
                    slug: 'all-features',
                  },
                },
                created_at: `2023-09-1${page}T07:33:24.695448+00:00`,
              },
            },
          ],
        },
        page !== 3
          ? {
              link: `<${baseUrl}/geography?bbox=4.705770%2C52.256977%2C5.106206%2C52.467268&geopage=${
                page + 1
              }>; rel="next"`,
            }
          : undefined
      );
    }

    const datasetConfig = {
      idKeyList: 'ma_melding_id',
    } as DatasetConfig;

    const response = await fetchMeldingenBuurt({
      url: urlPage1,
      transformResponse: (responseData) => {
        return transformMeldingenBuurtResponse(
          'mock-dataset',
          datasetConfig,
          JSON.parse(responseData)
        );
      },
      request: fetchMeldingenBuurt,
    });

    expect(response.data.length).toBe(3);
    expect(response.data[0].properties.id).toBe(
      'feature-1-202309110733246954480000'
    );
    expect(response.data[1].properties.id).toBe(
      'feature-2-202309120733246954480000'
    );
    expect(response.data[2].properties.id).toBe(
      'feature-3-202309130733246954480000'
    );
  });

  test('fetchMeldingenBuurt:error', async () => {
    const baseUrl =
      'https://api.meldingen.amsterdam.nl/signals/v1/public/signals';
    const api = nock(baseUrl);
    const url = new URL(
      `${baseUrl}/geography?bbox=4.705770%2C52.256977%2C5.106206%2C52.467268&geopage=1`
    );
    const urlPage1 = url.toString();
    const path = urlPage1.replace(baseUrl, '');

    const datasetConfig = {
      idKeyList: 'ma_melding_id',
    } as DatasetConfig;

    const requestData = () =>
      fetchMeldingenBuurt({
        url: urlPage1,
        transformResponse: (responseData) => {
          return transformMeldingenBuurtResponse(
            'mock-dataset',
            datasetConfig,
            responseData ? JSON.parse(responseData) : responseData
          );
        },
        request: fetchMeldingenBuurt,
      });

    api.get(path).reply(200, {});
    const response = await requestData();
    expect(response.data).toStrictEqual([]);

    api.get(path).replyWithError('not available');
    try {
      const response2 = await requestData();
    } catch (error: any) {
      expect(error.message).toBe('not available');
    }

    api.get(path).reply(500);
    try {
      const response3 = await requestData();
    } catch (error: any) {
      expect(error.message).toBe('Request failed with status code 500');
      expect(response.data).toStrictEqual([]);
    }
  });
});
