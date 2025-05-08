import { LatLngBoundsLiteral } from 'leaflet';

import {
  apiDependencyError,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { AuthProfileAndToken } from '../auth/auth-types';
import { fetchDataset } from './buurt/buurt';
import { datasetEndpoints } from './buurt/datasets';
import {
  filterDatasetFeatures,
  filterFeaturesinRadius,
  getBboxFromFeatures,
} from './buurt/helpers';
import { fetchMyLocation } from './bag/my-locations';
import {
  featureToggle,
  routeConfig,
  themaId,
} from '../../client/components/MyArea/MyArea-thema-config';

const WITHIN_RADIUS_KM = 1;

function getNotification(bbox: LatLngBoundsLiteral) {
  return {
    id: `wior-meldingen-notification`,
    datePublished: new Date().toISOString(),
    themaID: themaId,
    title: `Werkzaamheden gepland`,
    description: `Bij u in de buurt zijn binnen enkele maanden meerdaagsewerkzaamheden gepland`,
    link: {
      to: `${routeConfig.themaPage.path}?datasetIds=["wior"]&filters={"wior":{"datumStartUitvoering":{"values":{"Binnen enkele maanden":1}},"duur":{"values":{"Meerdaags":1}}}}&bbox=[[${bbox[0]}],[${bbox[1]}]]`,
      title: 'Bekijk de werkzaamheden op kaart',
    },
  };
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
  const MY_LOCATION = await fetchMyLocation(authProfileAndToken);

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
    const notification = getNotification(bbox);

    return apiSuccessResult({
      notifications:
        featureToggle.wiorMeldingen && filteredFeatures.length >= 2
          ? [notification]
          : [],
    });
  }

  return apiDependencyError({ MY_LOCATION });
}
