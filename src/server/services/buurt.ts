import { apiSuccesResult } from '../../universal/helpers';
import {
  CITY_LAYERS_CONFIG,
  CITY_ZOOM,
  DEFAULT_LAT,
  DEFAULT_LNG,
  HOOD_LAYERS_CONFIG,
  HOOD_ZOOM,
  LOCATION_ZOOM,
} from '../../universal/config';
import { apiSuccesResult } from '../../universal/helpers';
import { fetchHOME } from './home';
import { requestData } from '../helpers/source-api-request';
import { DataRequestConfig } from '../config';
import { apiErrorResult } from '../../universal/helpers/api';
import { getFullAddress } from '../../universal/helpers/brp';
import { response } from 'express';
import { defaultDateFormat } from '../../universal/helpers/date';

const MAP_URL =
  'https://data.amsterdam.nl/data/?modus=kaart&achtergrond=topo_rd_zw&embed=true';

export function getEmbedUrl(latlng: LatLngObject | null) {
  let lat = DEFAULT_LAT;
  let lng = DEFAULT_LNG;

  let embed = {
    advanced: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${CITY_ZOOM}&${CITY_LAYERS_CONFIG}&legenda=true`,
    simple: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${CITY_ZOOM}`,
  };

  if (latlng && latlng.lat && latlng.lng) {
    lat = latlng.lat;
    lng = latlng.lng;

    embed = {
      advanced: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${HOOD_ZOOM}&marker=${lat}%2C${lng}&${HOOD_LAYERS_CONFIG}&legenda=true&marker-icon=home`,
      simple: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lng}&marker-icon=home`,
    };
  }

  return embed;
}

export async function fetchBUURT(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  profileType: ProfileType
) {
  const HOME = await fetchHOME(
    sessionID,
    passthroughRequestHeaders,
    profileType
  );
  return apiSuccesResult({
    embed: getEmbedUrl(HOME.content?.latlng || null),
  });
}

export type DatasetItemTuple = [number, number, string];

function transformAfvalcontainers(WFSData: any) {
  const collection: Record<string, DatasetItemTuple[]> = {};
  for (const feature of WFSData.features) {
    const fractieOmschrijving = feature.properties?.fractie_omschrijving.toLowerCase();
    if (!collection[fractieOmschrijving]) {
      collection[fractieOmschrijving] = [];
    }
    if (feature?.geometry?.coordinates) {
      const [lng, lat] = feature.geometry.coordinates;
      collection[fractieOmschrijving].push([lat, lng, feature.properties.id]);
    }
  }
  return {
    id: 'afvalcontainers',
    collection,
  };
}

function transformAfvalcontainersDetail(responseData: any) {
  const afvalUrls: Record<string, string> = {
    rest:
      'https://www.amsterdam.nl/veelgevraagd/?productid=%7BC5AC6694-CB65-4ED8-B5B3-6794BEA279FD%7D',
    glas:
      'https://www.amsterdam.nl/veelgevraagd/?productid=%7B881CBA8B-AB9F-43DF-910F-6B5DF7A91080%7D',
    plastic:
      'https://www.amsterdam.nl/veelgevraagd/?productid=%7B3B03E107-63EC-40D0-B2E8-92BCCCE0B91A%7D',
    papier:
      'https://www.amsterdam.nl/veelgevraagd/?productid=%7B95B69586-623A-4333-9322-A48FF8424B77%7D',
    textiel:
      'https://www.amsterdam.nl/veelgevraagd/?caseid=%7BD68460AA-EB08-4132-A69F-7763CD8431A2%7D',
  };
  // {
  //   "id": "74769",
  //   "typeId": "3574",
  //   "type": "https://api.data.amsterdam.nl/v1/huishoudelijkafval/containertype/3574/",
  //   "status": 1,
  //   "clusterId": "117262.696|487637.492",
  //   "cluster": "https://api.data.amsterdam.nl/v1/huishoudelijkafval/cluster/117262.696%7C487637.492/",
  //   "fractie": "1",
  //   "locatieId": "25876",
  //   "locatie": "https://api.data.amsterdam.nl/v1/huishoudelijkafval/containerlocatie/25876/",
  //   "gbdBuurtId": "03630000000706",
  //   "gbdBuurt": "https://api.data.amsterdam.nl/v1/gebieden/buurten/03630000000706/",
  //   "idNummer": "REF31325",
  //   "geometrie": {
  //       "type": "Point",
  //       "coordinates": [
  //           117262.69587068968,
  //           487637.4922001306
  //       ]
  //   },
  //   "eigenaarId": "16",
  //   "serienummer": "HBD2.017.1242",
  //   "datumCreatie": "2017-10-04",
  //   "eigenaarNaam": "F Nieuw-West",
  //   "gbdBuurtCode": "F77a",
  //   "verwijderdDp": true,
  //   "datumPlaatsing": "2017-09-25",
  //   "geadopteerdInd": true,
  //   "datumOplevering": "2017-05-01",
  //   "bagOpenbareruimteId": "0363300000003060",
  //   "bagOpenbareruimte": "https://api.data.amsterdam.nl/v1/bag/openbareruimte/0363300000003060/",
  //   "datumOperationeel": "2017-09-25",
  //   "wijzigingsdatumDp": "2020-07-07T06:46:12.608540",
  //   "fractieOmschrijving": "Rest",
  //   "datumAflopenGarantie": "2024-05-01",
  //   "bagHoofdadresVerblijfsobjectId": "0363010000600262",
  //   "bagHoofdadresVerblijfsobject": "https://api.data.amsterdam.nl/v1/bag/verblijfsobject/0363010000600262/"
  // }
  const type = responseData.fractieOmschrijving.toLowerCase();
  return {
    title: `${capitalizeFirstLetter(type)} ${responseData.idNummer}`,
    type,
    url: afvalUrls[type],
  };
}

function transformEvenementen(WFSData: any) {
  const collection: Record<string, DatasetItemTuple[]> = { evenementen: [] };
  for (const feature of WFSData.features) {
    if (feature?.geometry?.coordinates) {
      const [lng, lat] = feature.geometry.coordinates;
      collection.evenementen.push([lat, lng, feature.properties.id]);
    }
  }

  return {
    id: 'evenementen',
    collection,
  };
}

function transformEvenementenDetail(responseData: any) {
  // {
  //   "titel": "Buurtexpositie \"Moooi .... zelf gemaakt!\"",
  //   "url": "https://evenementen.amsterdam.nl/evenementen/2020/08/buurtexpositie-moooi-2/",
  //   "omschrijving": "Buurtexpositie\r\ndé Zomerhit van MLB Galerie!\r\n\r\nMooooi… Zelf gemaakt!\r\nKom en laat je verrassen.\r\n15 creatieve buurtgenoten nemen voor 4 dagen de galerie over om het resultaat van hun passie aan de wereld te laten zien. Maak een praatje, drink een drankje of… koop iets heel leuks.\r\nVeel moois voor vriendelijke prijsjes!\r\n\r\nDigitale opening:19 augustus om 17.00 uur via zoomverbinding. \r\nHeel simpel: klik die dag vanaf 16.45 uur op de link op onze website www.mlbgalerie.nl.\r\n\r\nOpen: \r\ndonderdag 20 t/m zondag 23 augustus\r\ndo, vr en za: 13.00 - 18.00 uur; \r\nzo: 13.00 - 16.00 uur\r\n\r\nMLB Galerie, Witte de Withstraat 32A\r\n\r\nLet op: de toegang corona-proof + gratis\r\n\r\nWie: Dennis van Beek, Daphne van Dijk, Sjoerd Dijkstra, ellen tekent, Joke Engel, Storm Everts, Soxna Fall, Margreth Hoek, Vera Ore, Mieke de Rijk, Emmy Schrempft, Frea Spanjaard, Joop Souverein, René Wagenaar, Linda Zeelig\r\n\r\nWat: kaarten, finger boards, tekeningen, presse papiers, (zand)schilderijen, cartoons, borduursels, oorbellen, armbanden, kettingen, hangers, aquarel, zeefdrukken, hout/staal/glas\r\n\r\n Mede mogelijk gemaakt door Inspiratieteam de Baarsjes",
  //   "startdatum": "2020-08-23",
  //   "starttijd": "13:00:00",
  //   "einddatum": null,
  //   "eindtijd": "16:00:00"
  // }
  let starttijd;
  if (responseData.starttijd) {
    const parts = responseData.starttijd.split(':');
    parts.pop();
    starttijd = parts.join(':');
  }
  let eindtijd;
  if (responseData.eindtijd) {
    const parts = responseData.eindtijd.split(':');
    parts.pop();
    eindtijd = parts.join(':');
  }
  return {
    title: responseData.titel,
    description: responseData.omschrijving,
    url: responseData.url,
    dateStart: responseData.startdatum,
    dateEnd: responseData.einddatum || responseData.startdatum,
    timeStart: starttijd,
    timeEnd: eindtijd,
  };
}

function transformBekendmakingen(WFSData: any) {
  const collection: Record<string, DatasetItemTuple[]> = {};
  for (const feature of WFSData.features) {
    const onderwerp = feature.properties?.onderwerp.toLowerCase();
    if (!collection[onderwerp]) {
      collection[onderwerp] = [];
    }
    if (feature?.geometry?.coordinates) {
      const [lng, lat] = feature.geometry.coordinates;
      collection[onderwerp].push([lat, lng, feature.properties.ogc_fid]);
    }
  }

  return {
    id: 'bekendmakingen',
    collection,
  };
}

function transformBekendmakingenDetail(responseData: any) {
  // {
  //   "categorie": "wonen",
  //   "onderwerp": "omgevingsvergunning",
  //   "titel": "Aanvraag omgevingsvergunning kap Burg Hogguerstraat 2",
  //   "beschrijving": "Burg Hogguerstraat 2, 1064EB, aanvraag voor het kappen van één houtopstand, ontvangen op 15 ...",
  //   "url": "https://bekendmakingen.amsterdam.nl/bekendmakingen/stadsdeel-nieuw-west/2020/week-29/aanvragen/aanvraag-18/",
  //   "postcodehuisnummer": "",
  //   "plaats": "",
  //   "straat": "",
  //   "datum": "2020-07-21T22:00:00Z",
  //   "overheid": "Amsterdam"
  // }

  return {
    title: responseData.titel,
    subject: responseData.onderwerp,
    category: responseData.categorie,
    description: responseData.beschrijving,
    url: responseData.url,
    datePublished: responseData.datum,
  };
}

function transformParkeerzones(WFSData: any) {}

function transformParkeerzonesUitzonderingen(WFSData: any) {}

interface DatasetConfig {
  listUrl: string;
  detailUrl: string;
  transformList?: (data: any) => any;
  transformDetail?: (data: any) => any;
}

export const datasetEndpoints: Record<string, DatasetConfig> = {
  afvalcontainers: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/wfs/huishoudelijkafval/?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=container&OUTPUTFORMAT=geojson&SRSNAME=urn:ogc:def:crs:EPSG::4326',
    detailUrl: 'https://api.data.amsterdam.nl/v1/huishoudelijkafval/container/',
    transformList: transformAfvalcontainers,
    transformDetail: transformAfvalcontainersDetail,
  },
  evenementen: {
    listUrl:
      'https://map.data.amsterdam.nl/maps/evenementen?REQUEST=GetFeature&SERVICE=wfs&VERSION=2.0.0&TYPENAMES=evenementen&outputFormat=application/json;%20subtype=geojson;%20charset=utf-8&SRSNAME=urn:ogc:def:crs:EPSG::4326',
    detailUrl: 'https://api.data.amsterdam.nl/vsd/evenementen/',
    transformList: transformEvenementen,
    transformDetail: transformEvenementenDetail,
  },
  bekendmakingen: {
    listUrl:
      'https://map.data.amsterdam.nl/maps/bekendmakingen?REQUEST=GetFeature&SERVICE=wfs&VERSION=2.0.0&TYPENAMES=ms:bekendmakingen&outputFormat=application/json;%20subtype=geojson;%20charset=utf-8&SRSNAME=urn:ogc:def:crs:EPSG::4326',
    detailUrl: 'https://api.data.amsterdam.nl/vsd/bekendmakingen/',
    transformList: transformBekendmakingen,
    transformDetail: transformBekendmakingenDetail,
  },
  parkeerzones: {
    listUrl: '',
    detailUrl: '',
    transformList: transformParkeerzones,
  },
  parkeerzonesUitzonderingen: {
    listUrl: '',
    detailUrl: '',
    transformList: transformParkeerzonesUitzonderingen,
  },
};

export async function loadServicesMapDatasets(sessionID: SessionID) {
  const requests = Object.entries(datasetEndpoints)
    .filter(([, config]) => !!config.listUrl)
    .map(([dataset, config]) => {
      const requestConfig: DataRequestConfig = {
        url: config.listUrl,
      };
      if (config.transformList) {
        requestConfig.transformResponse = config.transformList;
      }
      return requestData(requestConfig, sessionID, {});
    });

  const datasets = await Promise.all(requests);
  return apiSuccesResult(datasets.map(({ content }) => content));
}

export async function loadServicesMapDatasetItem(
  sessionID: SessionID,
  dataset: string,
  id: string
) {
  const config = datasetEndpoints[dataset];
  if (!config) {
    return apiErrorResult(`Unknown dataset ${dataset}`, null);
  }
  const requestConfig: DataRequestConfig = {
    url: `${config.detailUrl}${id}`,
  };
  if (config.transformDetail) {
    requestConfig.transformResponse = config.transformDetail;
  }
  console.log('Requesting dataset detail', requestConfig);
  const result = await requestData(requestConfig, sessionID, {});
  console.log('Dataset detail result', result);
  return result;
}
