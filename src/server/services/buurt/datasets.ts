import { DATASETS } from '../../../universal/config/buurt';
import { getApiEmbeddedResponse } from './helpers';

export type DatasetFeatureProperties = {
  id: string;
  datasetId: string;
  color?: string;
};
export type MaFeature<
  G extends GeoJSON.Geometry = Exclude<
    GeoJSON.Geometry,
    GeoJSON.GeometryCollection
  >
> = GeoJSON.Feature<G, DatasetFeatureProperties>;
export type MaPointFeature = MaFeature<GeoJSON.Point>;
export type MaPolyLineFeature = MaFeature<GeoJSON.MultiPolygon>;
export type DatasetCollection = MaFeature[];

export const BUURT_CACHE_TTL_HOURS = 24;
export const ACCEPT_CRS_4326 = {
  'Accept-Crs': 'EPSG:4326', // Will return coordinates in [lng/lat] format
};

const CONTAINER_STATUS_ACTIVE = 1;

export interface DatasetConfig {
  datasetIds?: string[];
  listUrl?: string;
  detailUrl?: string;
  transformList?: (data: any) => any;
  transformDetail?: (data: any) => any;
}

export const datasetEndpoints: Record<string, DatasetConfig> = {
  afvalcontainers: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/wfs/huishoudelijkafval/?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=container&OUTPUTFORMAT=geojson&SRSNAME=urn:ogc:def:crs:EPSG::4326&FILTER=%3CFilter%3E%3CAnd%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Estatus%3C/PropertyName%3E%3CLiteral%3E1%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3COr%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E110%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E16%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E111%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E112%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E67%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E181%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E113%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3C/Or%3E%3C/And%3E%3C/Filter%3E',
    detailUrl: 'https://api.data.amsterdam.nl/v1/huishoudelijkafval/container/',
    transformList: transformAfvalcontainers,
  },
  evenementen: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/evenementen/evenementen/?_fields=id,geometry&page_size=1000',
    detailUrl: 'https://api.data.amsterdam.nl/v1/evenementen/evenementen/',
    transformList: transformEvenementen,
  },
  bekendmakingen: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/bekendmakingen/bekendmakingen/?_fields=id,geometry,onderwerp&page_size=10000',
    detailUrl:
      'https://api.data.amsterdam.nl/v1/bekendmakingen/bekendmakingen/',
    transformList: transformBekendmakingen,
  },
  parkeerzones: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/parkeerzones/parkeerzones/?_fields=id,geometry,gebiedskleurcode,gebiedsnaam&indicatieZichtbaar=TRUE&page_size=500',
    detailUrl: 'https://api.data.amsterdam.nl/v1/parkeerzones/parkeerzones/',
    transformList: (responseData) =>
      transformParkeerzoneCoords('parkeerzones', responseData),
  },
  parkeerzones_uitzondering: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/parkeerzones/parkeerzones_uitzondering/?_fields=id,geometry,gebiedsnaam&indicatieZichtbaar=TRUE&page_size=100',
    detailUrl:
      'https://api.data.amsterdam.nl/v1/parkeerzones/parkeerzones_uitzondering/',
    transformList: (responseData) =>
      transformParkeerzoneCoords('parkeerzones_uitzondering', responseData),
  },
  zwembad: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/sport/zwembad/?_fields=id,geometry&page_size=30',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/zwembad/',
    transformList: (responseData: any) =>
      transformListSportApiResponse('zwembad', responseData),
  },
  sportpark: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/sport/sportpark/?_fields=id,geometry&page_size=60',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportpark/',
    transformList: (responseData: any) =>
      transformListSportApiResponse('sportpark', responseData),
  },
  sportveld: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/sport/sportveld/?_fields=id,geometry&page_size=1000',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportveld/',
    transformList: (responseData: any) =>
      transformListSportApiResponse('sportveld', responseData),
  },
  gymsportzaal: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/sport/gymsportzaal/?_fields=id,adres,plaats&page_size=150',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/gymsportzaal/',
    transformList: (responseData: any) =>
      transformListSportApiResponse('gymsportzaal', responseData),
  },
  sporthal: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/sport/sporthal/?_fields=id,geometry&page_size=50',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sporthal/',
    transformList: (responseData: any) =>
      transformListSportApiResponse('sporthal', responseData),
  },
  sportaanbieder: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/sport/sportaanbieder/?_fields=id,geometry&page_size=2000',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportaanbieder/',
    transformList: (responseData: any) =>
      transformListSportApiResponse('sportaanbieder', responseData),
  },
  openbaresportplek: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/sport/openbaresportplek/?_fields=id,geometry&page_size=1000',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/openbaresportplek/',
    transformList: (responseData: any) =>
      transformListSportApiResponse('openbaresportplek', responseData),
  },
  hardlooproute: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/sport/hardlooproute/?_fields=id,geometry&page_size=50',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/hardlooproute/',
    transformList: (responseData: any) =>
      transformListSportApiResponse('hardlooproute', responseData),
  },
};

function transformListSportApiResponse(datasetId: string, responseData: any) {
  const results = getApiEmbeddedResponse(datasetId, responseData);
  const collection: DatasetCollection = [];

  if (results && results.length) {
    for (const feature of results) {
      if (feature.geometry?.coordinates) {
        const properties: DatasetFeatureProperties = {
          id: feature.id,
          datasetId,
        };
        if (
          feature.geometry.type === 'MultiPolygon' ||
          feature.geometry.type === 'MultiLineString'
        ) {
          properties.color = 'purple';
        }
        collection.push({
          type: 'Feature',
          geometry: feature.geometry,
          properties,
        });
      }
    }
  }

  return collection;
}

function transformAfvalcontainers(WFSData: any) {
  const collection: DatasetCollection = [];
  for (const feature of WFSData.features) {
    const fractieOmschrijving = feature.properties?.fractie_omschrijving.toLowerCase();
    // Redundant filtering, the API should return with the proper dataset already
    if (
      feature.properties?.status === CONTAINER_STATUS_ACTIVE &&
      DATASETS.afvalcontainers.includes(fractieOmschrijving)
    ) {
      if (feature?.geometry?.coordinates) {
        collection.push({
          type: 'Feature',
          geometry: feature.geometry,
          properties: {
            id: feature.properties.id,
            datasetId: fractieOmschrijving,
          },
        });
      }
    }
  }
  return collection;
}

function transformEvenementen(responseData: any) {
  const results = getApiEmbeddedResponse('evenementen', responseData);
  const collection: DatasetCollection = [];
  if (results && results.length) {
    for (const feature of results) {
      if (feature?.geometry?.coordinates) {
        collection.push({
          type: 'Feature',
          geometry: feature.geometry,
          properties: {
            id: feature.id,
            datasetId: 'evenementen',
          },
        });
      }
    }
  }
  return collection;
}

function transformBekendmakingen(responseData: any) {
  const results = getApiEmbeddedResponse('bekendmakingen', responseData);
  const collection: DatasetCollection = [];

  if (results && results.length) {
    for (const feature of results) {
      const datasetId = feature?.onderwerp.toLowerCase();

      if (feature?.geometry?.coordinates) {
        collection.push({
          type: 'Feature',
          geometry: feature.geometry,
          properties: {
            id: feature.id,
            datasetId,
          },
        });
      }
    }
  }
  return collection;
}

function transformParkeerzoneCoords(datasetId: string, responseData: any) {
  const results = getApiEmbeddedResponse(datasetId, responseData);
  const collection: DatasetCollection = [];
  if (results && results.length) {
    for (const feature of results) {
      collection.push({
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          id: feature.id,
          datasetId,
          color: feature.gebiedskleurcode,
        },
      });
    }
  }
  return collection;
}
