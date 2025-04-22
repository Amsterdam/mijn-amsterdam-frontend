import { differenceInYears } from 'date-fns';
import { LatLngBoundsLiteral } from 'leaflet';

import { fetchBRP } from './brp';
import { fetchDataset } from './buurt/buurt';
import {
  datasetEndpoints,
  DatasetFeatureProperties,
  MaPointFeature,
} from './buurt/datasets';
import {
  filterDatasetFeatures,
  filterFeaturesinRadius,
  getBboxFromFeatures,
} from './buurt/helpers';
import { fetchMyLocation } from './my-locations';
import { routeConfig as buurtRouteConfig } from '../../client/components/MyArea/MyArea-thema-config';
import {
  themaId,
  themaTitle,
} from '../../client/pages/Thema/Afval/Afval-thema-config';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { MyNotification } from '../../universal/types';
import { AuthProfileAndToken } from '../auth/auth-types';

const ADULT_AGE = 18;
const LATE_TEEN_AGE = 16;
const WITHIN_RADIUS_KM = 0.1; // 100m
const datasetId = 'afvalcontainers';
const config = datasetEndpoints[datasetId];
const filters = {
  [datasetId]: {
    geadopteerd_ind: { values: { Nee: 1 } },
  },
};

const filterQueryParam = encodeURIComponent(JSON.stringify(filters));

export async function fetchAdoptableTrashContainers(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const BRP = await fetchBRP(requestID, authProfileAndToken);

  if (!BRP.content?.persoon?.geboortedatum) {
    return apiDependencyError({ BRP });
  }

  const age = differenceInYears(
    new Date(),
    BRP.content?.persoon?.geboortedatum
  );
  // Business requested to not show this tip to children younger than a certain age.
  if (age < LATE_TEEN_AGE) {
    return apiSuccessResult({
      tips: [],
    });
  }

  const MY_LOCATION = await fetchMyLocation(requestID, authProfileAndToken);

  if (MY_LOCATION.status !== 'OK' || !MY_LOCATION.content?.[0]?.latlng) {
    return apiDependencyError({ MY_LOCATION });
  }

  const afvalcontainersDatasetResponse = await fetchDataset(
    requestID,
    datasetId,
    config,
    {}
  ).then((result) => {
    return {
      ...result,
      id: datasetId,
    };
  });

  if (afvalcontainersDatasetResponse.status !== 'OK') {
    return apiDependencyError({
      AFVALCONTAINERS: afvalcontainersDatasetResponse,
    });
  }

  const latlng = MY_LOCATION.content[0].latlng;

  // Incoming Coordinates are in a different format (lng,lat instead of lat,lng) than we use for comparison.
  const DO_SWAP_LAT_LNG_FOR_DISTANCE_COMPARISON = true;

  const featuresInRadius = filterFeaturesinRadius(
    latlng,
    afvalcontainersDatasetResponse.content.features,
    WITHIN_RADIUS_KM,
    DO_SWAP_LAT_LNG_FOR_DISTANCE_COMPARISON
  );

  const filteredFeatures: MaPointFeature<DatasetFeatureProperties>[] =
    filterDatasetFeatures<DatasetFeatureProperties>(
      featuresInRadius,
      [datasetId],
      filters
    );

  const bbox = getBboxFromFeatures(
    filteredFeatures,
    latlng,
    DO_SWAP_LAT_LNG_FOR_DISTANCE_COMPARISON
  );

  return apiSuccessResult({
    tips: filteredFeatures.length ? [buildNotification(age, bbox)] : [],
  });
}

function determineDescriptionText(age: number): string {
  if (age >= ADULT_AGE) {
    return `Help mee om uw eigen buurt schoon te houden en adopteer een afvalcontainer.
 Liever op een andere manier bijdragen? Leen dan een afvalgrijper!`;
  }

  return `Help mee om je eigen buurt schoon te houden en adopteer een afvalcontainer.
 Wil je liever iets anders doen? Leen dan een afvalgrijper!`;
}

function buildNotification(
  age: number,
  bbox: LatLngBoundsLiteral
): MyNotification {
  return {
    id: 'adoptable-trash-container-notification',
    datePublished: new Date().toISOString(),
    themaID: themaId,
    themaTitle: themaTitle,
    title: 'Adopteer een afvalcontainer',
    isTip: true,
    tipReason:
      'U ziet deze tip omdat er bij u in de buurt een afvalcontainer is die u kunt adopteren.',
    description: determineDescriptionText(age),
    link: {
      to: `${buurtRouteConfig.themaPage.path}?datasetIds=["afvalcontainers"]&filters=${filterQueryParam}&bbox=[[${bbox[0]}],[${bbox[1]}]]`,
      title: 'Bekijk de containers op de kaart',
    },
  };
}

export const forTesting = { determineDescriptionText };
