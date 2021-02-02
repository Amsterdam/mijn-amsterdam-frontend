import * as config from '../../../universal/config/buurt';
import { ApiResponse } from '../../../universal/helpers';
import {
  datasetEndpoints,
  DatasetResponse,
  MaPointFeature,
  MaPolylineFeature,
} from './datasets';
import {
  createDynamicFilterConfig,
  createFeaturePropertiesFromPropertyFilterConfig,
  datasetApiResult,
  filterAndRefineFeatures,
  filterDatasetFeatures,
  filterPointFeaturesWithinBoundingBox,
  filterPolylineFeaturesWithinBoundingBox,
  getApiEmbeddedResponse,
  getDatasetEndpointConfig,
  getDynamicDatasetFilters,
  getPropertyFilters,
  isCoordWithingBoundingBox,
  recursiveCoordinateSwap,
  refineFilterSelection,
  transformDsoApiListResponse,
} from './helpers';

const DSO_API_RESULT = {
  _links: {
    self: {
      href: 'https://api.data.amsterdam.nl/v1/sport/openbaresportplek/',
    },
    next: {
      href: 'https://api.data.amsterdam.nl/v1/sport/openbaresportplek/?page=2',
    },
    previous: {
      href: null,
    },
  },
  _embedded: {
    openbaresportplek: [
      {
        _links: {
          self: {
            href: 'https://api.data.amsterdam.nl/v1/sport/openbaresportplek/1/',
            title: 'NIEUWENDAM',
          },
        },
        schema:
          'https://schemas.data.amsterdam.nl/datasets/sport/sport#openbaresportplek',
        id: 1,
        foto: 'Nieuwendam_1.jpg',
        naam: 'NIEUWENDAM',
        geometry: {
          type: 'Point',
          coordinates: [4.8, 52.2],
        },
        oppervlakte: 507,
        omschrijving: 'Basketbalpaal, speeltuin Nieuwendam',
        soortLocatie: 'Speeltuin',
        soortOmheining: 'Geen',
        soortOndergrond: 'Asfalt',
        soortVerlichting: 'Ja',
        sportvoorziening: 'Basketbal',
        indicatieOverdekt: 'Nee',
      },
    ],
  },
  page: {
    number: 1,
    size: 20,
    totalElements: 824,
    totalPages: 42,
  },
};

const DSO_API_RESULT2 = {
  _links: {
    self: { href: 'https://api.data.amsterdam.nl/v1/sport/sportveld/' },
    next: {
      href:
        'https://api.data.amsterdam.nl/v1/sport/sportveld/?page=2&_pageSize=1',
    },
    previous: { href: null },
  },
  _embedded: {
    sportveld: [
      {
        _links: {
          self: {
            href: 'https://api.data.amsterdam.nl/v1/sport/sportveld/1/',
            title: 'Sportpark Middenmeer-Voorland 02',
          },
        },
        schema:
          'https://schemas.data.amsterdam.nl/datasets/sport/sport#sportveld',
        id: 1,
        id2: '{E3710BD2-A5E2-48A6-8486-B9B3F8E18FC8}',
        omtrek: 314.84447,
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [4.948418551871725, 52.349302960452505],
                [4.948398653104854, 52.34932100133867],
              ],
            ],
          ],
        },
        sportpark: 'Sportpark Middenmeer-Voorland',
        objecttype: 'Sportveld (begroeid)',
        oppervlakte: 5825.39499,
        sportfunctie: 'Honkbal/softbal',
        veldindeling: 'SPO-MIDD-15',
        objectsubtype: 'Gras- en kruidachtigen',
        soortOndergrond: 'Gras',
        jaarVanActiviteit: 2012.0,
        sportparkFunctioneleNaam: 'Sportpark Middenmeer-Voorland 02',
      },
    ],
  },
  page: { number: 1, size: 1, totalElements: 636, totalPages: 636 },
};

const OPENBARESPORTPLEK1 = {
  geometry: { coordinates: [15, 15] },
  properties: {
    sportvoorziening: 'Sportvoorziening1',
    soortOndergrond: 'SoortOndergrond1',
    datasetId: 'openbaresportplek',
  },
};
const OPENBARESPORTPLEK2 = {
  geometry: { coordinates: [25, 25] },
  properties: {
    sportvoorziening: 'Sportvoorziening2',
    soortOndergrond: 'SoortOndergrond2',
    datasetId: 'openbaresportplek',
  },
};
const OPENBARESPORTPLEK3 = {
  geometry: { coordinates: [15, 15] },
  properties: {
    sportvoorziening: 'Sportvoorziening3',
    soortOndergrond: 'SoortOndergrond3',
    datasetId: 'openbaresportplek',
  },
};
const OPENBARESPORTPLEK4 = {
  geometry: { coordinates: [25, 25] },
  properties: {
    sportvoorziening: 'Sportvoorziening2',
    soortOndergrond: 'SoortOndergrond2',
    datasetId: 'openbaresportplek',
  },
};
const PARKEERZONE1 = {
  geometry: { coordinates: [20, 20] },
  properties: {
    datasetId: 'parkeerzones',
    gebiedsnaam: 'West',
  },
};
const BEKENDMAKING1 = {
  geometry: { coordinates: [20, 20] },
  properties: {
    datasetId: 'bekendmakingen',
  },
};
const features: any = [
  OPENBARESPORTPLEK1,
  OPENBARESPORTPLEK2,
  OPENBARESPORTPLEK3,
  OPENBARESPORTPLEK4,
  PARKEERZONE1,
  BEKENDMAKING1,
];

describe('Buurt helpers', () => {
  let ORIGINAL_DATASETS = config.DATASETS;
  let DATASETS: any = null;

  beforeAll(() => {
    DATASETS = (config.DATASETS as any) = {
      sport: {
        datasets: {
          openbaresportplek: {
            title: 'Openbare sportplek',
            filters: {
              sportvoorziening: {
                // title: 'Sportvoorziening',
                valueConfig: {
                  Null: { title: 'Onbekend' },
                },
              },
              soortOndergrond: {
                title: 'Soort ondergrond',
                valueConfig: {
                  '': { title: 'Onbekend' },
                },
              },
              soortLocatie: {
                title: 'Soort locatie',
                valueConfig: {
                  '': { title: 'Onbekend' },
                },
              },
            },
          },
          test: {
            title: 'Afgeleid van openbare sportplek',
          },
          sportveld: {
            title: 'Sportveld',
            filters: {
              sportfunctie: {
                title: '',
                valueConfig: {
                  Null: { title: 'Overig' },
                },
              },
              soortOndergrond: {
                title: 'Soort ondergrond',
                valueConfig: {
                  Null: { title: 'Onbekend' },
                },
              },
            },
          },
        },
      },
    };
  });

  afterAll(() => {
    (config.DATASETS as any) = ORIGINAL_DATASETS;
  });

  it('Should extract correct api response', () => {
    const result = ['api-result'];
    expect(
      getApiEmbeddedResponse('test', { _embedded: { test: result } })
    ).toBe(result);

    const result2 = 'bliep';
    expect(
      getApiEmbeddedResponse('test', { _embedded: { test: result2 } })
    ).toBe(null);
  });

  it('Should getDatasetEndpointConfig', () => {
    expect(getDatasetEndpointConfig(['openbaresportplek'])).toStrictEqual([
      ['openbaresportplek', datasetEndpoints.openbaresportplek],
    ]);

    expect(
      getDatasetEndpointConfig(
        ['openbaresportplek', 'sportveld'],
        ['MultiPolygon']
      )
    ).toStrictEqual([['sportveld', datasetEndpoints.sportveld]]);
  });

  it('Should recursiveCoordinateSwap', () => {
    const X = 1;
    const Y = 2;
    const X2 = 10;
    const Y2 = 20;

    expect(
      recursiveCoordinateSwap([
        [
          [X, Y],
          [X2, Y2],
        ],
      ])
    ).toStrictEqual([
      [
        [Y, X],
        [Y2, X2],
      ],
    ]);
  });

  it('Should isCoordWithingBoundingBox', () => {
    expect(isCoordWithingBoundingBox([10, 10, 20, 20], [15, 15])).toBe(true);
    expect(isCoordWithingBoundingBox([10, 10, 20, 20], [5, 33])).toBe(false);
  });

  it('Should filterPolylineFeaturesWithinBoundingBox', () => {
    const features: any = [
      {
        geometry: { coordinates: [[15, 15]] },
      },
      {
        geometry: { coordinates: [[25, 25]] },
      },
    ];
    expect(
      filterPolylineFeaturesWithinBoundingBox(features, [10, 10, 20, 20]).length
    ).toBe(1);
    const features2: any = [
      {
        geometry: { coordinates: [[[[15, 15]]]] },
      },
      {
        geometry: { coordinates: [[[25, 25]]] },
      },
    ];
    expect(
      filterPolylineFeaturesWithinBoundingBox(features2, [10, 10, 20, 20])
        .length
    ).toBe(1);
  });

  it('Should filterPointFeaturesWithinBoundingBox', () => {
    const features: any = [
      {
        geometry: { coordinates: [15, 15] },
      },
      {
        geometry: { coordinates: [25, 25] },
      },
    ];
    expect(
      filterPointFeaturesWithinBoundingBox(features, [10, 10, 20, 20]).length
    ).toBe(1);
  });

  it('Should getDynamicDatasetFilters', () => {
    expect(getDynamicDatasetFilters('openbaresportplek')).toStrictEqual(
      DATASETS.sport.datasets.openbaresportplek.filters
    );
  });

  it('Should createDynamicFilterConfig', () => {
    const filterConfig = {
      sportvoorziening: {
        // title: 'Sportvoorziening',
        valueConfig: {
          Null: { title: 'Onbekend' },
        },
      },
      soortOndergrond: {
        title: 'Soort ondergrond',
        valueConfig: {
          '': { title: 'Onbekend' },
        },
      },
    };

    const dynamicFilterConfig = {
      soortOndergrond: {
        values: {
          SoortOndergrond1: 1,
          SoortOndergrond2: 2,
          SoortOndergrond3: 1,
        },
      },
      sportvoorziening: {
        values: {
          Sportvoorziening1: 1,
          Sportvoorziening2: 2,
          Sportvoorziening3: 1,
        },
      },
    };
    expect(
      createDynamicFilterConfig('openbaresportplek', features, filterConfig)
    ).toStrictEqual(dynamicFilterConfig);
  });

  it('Should filterDatasetFeatures, filter the right features with only datasetid', () => {
    expect(
      filterDatasetFeatures(features, ['parkeerzones'], {})
    ).toStrictEqual([PARKEERZONE1]);
  });

  it('Should filterDatasetFeatures, filter the right features with datasetid and 1 filter', () => {
    expect(
      filterDatasetFeatures(features, ['openbaresportplek'], {
        openbaresportplek: {
          soortOndergrond: { values: { SoortOndergrond2: 1 } },
        },
      }).length
    ).toBe(2);
  });

  it('Should filterDatasetFeatures, filter the right features with datasetid and multiple filters', () => {
    expect(
      filterDatasetFeatures(features, ['openbaresportplek'], {
        openbaresportplek: {
          soortOndergrond: {
            values: { SoortOndergrond2: 1, SoortOndergrond1: 1 },
          },
        },
      }).length
    ).toBe(3);
  });

  it('Should filterDatasetFeatures, filter the right features with multiple datasetids and multiple filters', () => {
    expect(
      filterDatasetFeatures(features, ['openbaresportplek', 'parkeerzones'], {
        openbaresportplek: {
          soortOndergrond: {
            values: { SoortOndergrond3: 1 },
          },
        },
      }).length
    ).toBe(2);
  });

  it('Should filterDatasetFeatures, filter the right features with multiple datasetids but no matching filters', () => {
    expect(
      filterDatasetFeatures(features, ['openbaresportplek', 'parkeerzones'], {
        openbaresportplek: {
          foo: {
            values: { bar: 1 },
          },
        },
        parkeerzones: {
          bliep: {
            values: { sblap: 1 },
          },
        },
      }).length
    ).toBe(0);
  });

  it('Should refineFilterSelection', () => {
    const featuresPartial = features.filter(
      (feature: any) =>
        feature.properties.soortOndergrond !== 'SoortOndergrond2'
    );
    expect(
      refineFilterSelection(featuresPartial, {
        openbaresportplek: {
          soortOndergrond: {
            values: {
              SoortOndergrond3: 1,
              SoortOndergrond2: 2,
              SoortOndergrond1: 1,
            },
          },
        },
      })
    ).toStrictEqual({
      openbaresportplek: {
        soortOndergrond: {
          values: {
            SoortOndergrond1: 1,
            SoortOndergrond2: 2,
            SoortOndergrond3: 1,
          },
          valuesRefined: {
            SoortOndergrond1: 1,
            SoortOndergrond3: 1,
            SoortOndergrond2: 0,
          },
        },
      },
    });

    expect(
      refineFilterSelection([], {
        openbaresportplek: {
          soortOndergrond: {
            values: {
              SoortOndergrond3: 1,
              SoortOndergrond2: 2,
              SoortOndergrond1: 1,
            },
          },
        },
      })
    ).toStrictEqual({
      openbaresportplek: {
        soortOndergrond: {
          values: {
            SoortOndergrond1: 1,
            SoortOndergrond2: 2,
            SoortOndergrond3: 1,
          },
          valuesRefined: {
            SoortOndergrond1: 0,
            SoortOndergrond3: 0,
            SoortOndergrond2: 0,
          },
        },
      },
    });
  });

  it('Should filterAndRefineFeatures', () => {
    const filterSelection = {
      openbaresportplek: {
        soortOndergrond: {
          values: { SoortOndergrond3: 1 },
        },
      },
    };
    const filtersBase = {
      openbaresportplek: {
        soortOndergrond: {
          values: {
            SoortOndergrond3: 1,
            SoortOndergrond2: 2,
            SoortOndergrond1: 1,
          },
        },
      },
      parkeerzones: {
        gebiedsnaam: {
          values: {
            West: 1,
          },
        },
      },
    };

    const datasetIds = ['openbaresportplek', 'parkeerzones'];

    const result = {
      features: [OPENBARESPORTPLEK3, PARKEERZONE1],
      filters: {
        openbaresportplek: {
          soortOndergrond: {
            values: {
              SoortOndergrond1: 1,
              SoortOndergrond2: 2,
              SoortOndergrond3: 1,
            },
            valuesRefined: {
              SoortOndergrond3: 1,
              SoortOndergrond1: 0,
              SoortOndergrond2: 0,
            },
          },
        },
        parkeerzones: {
          gebiedsnaam: {
            values: {
              West: 1,
            },
            valuesRefined: {
              West: 1,
            },
          },
        },
      },
    };

    expect(
      filterAndRefineFeatures(
        features,
        datasetIds,
        filterSelection,
        filtersBase
      )
    ).toStrictEqual(result);
  });

  it('Should getPropertyFilters', () => {
    expect(getPropertyFilters('openbaresportplek')).toStrictEqual(
      DATASETS.sport.datasets.openbaresportplek.filters
    );
  });

  it('Should createFeaturePropertiesFromPropertyFilterConfig', () => {
    const targetFeatureProperties = {
      id: 'test',
      datasetId: 'openbaresportplek',
    };

    const sourceFeature = {
      properties: {
        soortOndergrond: 'soortOndergrond1',
        sportvoorziening: 'sportvoorziening1',
        foo: 'bar',
        hello: 'world',
      },
    };

    const transformedFeatureProperties = {
      ...targetFeatureProperties,
      soortOndergrond: 'SoortOndergrond1',
      sportvoorziening: 'Sportvoorziening1',
      soortLocatie: 'Undefined',
    };

    expect(
      createFeaturePropertiesFromPropertyFilterConfig(
        'openbaresportplek',
        targetFeatureProperties,
        sourceFeature
      )
    ).toStrictEqual(transformedFeatureProperties);
  });

  it('Should datasetApiResult', () => {
    const apiResponses: ApiResponse<DatasetResponse | null>[] = [
      {
        status: 'OK',
        content: { features: features.slice(0, 2) },
      },
      {
        status: 'OK',
        content: { features: features.slice(2) },
      },
      {
        status: 'ERROR',
        content: null,
        message: 'Internal server error 500',
        id: 'unreachable-dataset',
      },
    ];
    const datasetResults = {
      errors: [
        {
          message: 'Internal server error 500',
          id: 'unreachable-dataset',
        },
      ],
      features,
      filters: {},
    };
    expect(datasetApiResult(apiResponses)).toStrictEqual(datasetResults);
  });

  it('Should transformDsoApiListResponse, transform Point feature', () => {
    const datasetResultTransformed: MaPointFeature[] = [
      {
        geometry: {
          coordinates: [4.8, 52.2],
          type: 'Point',
        },
        properties: {
          datasetId: 'openbaresportplek',
          id: '1',
          soortLocatie: 'Speeltuin',
          soortOndergrond: 'Asfalt',
          sportvoorziening: 'Basketbal',
        },
        type: 'Feature',
      },
    ];
    expect(
      transformDsoApiListResponse(
        'openbaresportplek',
        DATASETS.sport.datasets.openbaresportplek,
        DSO_API_RESULT
      )
    ).toStrictEqual(datasetResultTransformed);
  });

  it('Derives dataset from DSO dataset with different name', () => {
    const datasetResultTransformed: MaPointFeature[] = [
      {
        geometry: {
          coordinates: [4.8, 52.2],
          type: 'Point',
        },
        properties: {
          datasetId: 'test',
          id: '1',
        },
        type: 'Feature',
      },
    ];
    expect(
      transformDsoApiListResponse(
        'test',
        DATASETS.sport.datasets.test,
        DSO_API_RESULT,
        'openbaresportplek'
      )
    ).toStrictEqual(datasetResultTransformed);
  });

  it('Should transformDsoApiListResponse, transform Polyline feature', () => {
    const datasetResultTransformed: MaPolylineFeature[] = [
      {
        geometry: {
          coordinates: [
            [
              [
                [52.349302960452505, 4.948418551871725],
                [52.34932100133867, 4.948398653104854],
              ],
            ],
          ],
          type: 'MultiPolygon',
        },
        properties: {
          color: 'green',
          datasetId: 'sportveld',
          id: '1',
          soortOndergrond: 'Gras',
          sportfunctie: 'Honkbal/softbal',
        },
        type: 'Feature',
      },
    ];
    expect(
      transformDsoApiListResponse(
        'sportveld',
        DATASETS.sport.datasets.sportveld,
        DSO_API_RESULT2
      )
    ).toStrictEqual(datasetResultTransformed);
  });
});
