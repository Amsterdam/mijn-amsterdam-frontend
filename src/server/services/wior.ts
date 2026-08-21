import type { LatLngBoundsLiteral } from 'leaflet';

import {
  apiDependencyError,
  apiSuccessResult,
} from '../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../auth/auth-types.ts';
import { fetchMyLocations } from './bag/my-locations.ts';
import { fetchDataset } from './buurt/buurt.ts';
import { datasetEndpoints } from './buurt/datasets.ts';
import {
  filterDatasetFeatures,
  filterFeaturesinRadius,
  getBboxFromFeatures,
} from './buurt/helpers.ts';
import {
  featureToggle,
  routeConfig,
  themaId,
  themaTitle,
} from '../../client/components/MyArea/MyArea-thema-config.ts';
import type { MyNotification } from '../../universal/types/App.types.ts';

const WITHIN_RADIUS_KM = 1;

const sortLatestToFirst = (a: string, b: string) =>
  a && b ? b.localeCompare(a) : 0;

function getNotification(
  bbox: LatLngBoundsLiteral,
  dateStartExecution: string
) {
  return {
    id: `wior-meldingen-notification`,
    datePublished: dateStartExecution,
    themaTitle,
    themaID: themaId,
    hideDatePublished: true,
    title: `Werkzaamheden gepland`,
    description: `Bij u in de buurt zijn binnen enkele maanden meerdaagsewerkzaamheden gepland`,
    link: {
      to: `${routeConfig.themaPage.path}?datasetIds=["wior"]&filters={"wior":{"datumStartUitvoering":{"values":{"Binnen enkele maanden":1}},"duur":{"values":{"Meerdaags":1}}}}&bbox=[[${bbox[0]}],[${bbox[1]}]]`,
      title: 'Bekijk de werkzaamheden op kaart',
    },
  } as MyNotification;
}

export async function fetchWiorNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const datasetId = 'wior';
  const config = datasetEndpoints.wior;
  const filters = {
    wior: {
      datumStartUitvoering: {
        values: {
          'Binnen enkele maanden': 1,
        },
      },
      duur: {
        values: {
          Meerdaags: 1,
        },
      },
    },
  };
  const wiorMeldingen = await fetchDataset(datasetId, config, {}).then(
    (result) => {
      return {
        ...result,
        id: datasetId,
      };
    }
  );
  const MY_LOCATION = await fetchMyLocations(authProfileAndToken);

  if (
    MY_LOCATION.status === 'OK' &&
    MY_LOCATION.content?.[0]?.latlng &&
    wiorMeldingen?.status === 'OK'
  ) {
    // Take first address
    const latlng = MY_LOCATION.content[0].latlng;
    const featuresInRadius = filterFeaturesinRadius(
      latlng,
      wiorMeldingen.content.features,
      WITHIN_RADIUS_KM
    );
    const filteredFeatures = filterDatasetFeatures(
      featuresInRadius,
      [datasetId],
      filters
    );
    const bbox = getBboxFromFeatures(filteredFeatures, latlng);

    const startingDates = filteredFeatures
      .map((f) => f.properties.isoDatumStartUitvoering as string)
      .filter(Boolean)
      .toSorted(sortLatestToFirst);
    const latestStartingDate = startingDates[0] ?? new Date(0).toISOString();
    const notification = getNotification(bbox, latestStartingDate);

    return apiSuccessResult({
      notifications:
        featureToggle.wiorMeldingen && filteredFeatures.length >= 2
          ? [notification]
          : [],
    });
  }

  return apiDependencyError({ MY_LOCATION });
}
