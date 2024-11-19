import { LatLngTuple } from 'leaflet';

import { FeatureToggle } from '../../universal/config/feature-toggles';
import { Themas } from '../../universal/config/thema';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { AuthProfileAndToken } from '../auth/auth-types';
import { fetchDataset } from './buurt/buurt';
import { datasetEndpoints } from './buurt/datasets';
import { filterDatasetFeatures, filterFeaturesinRadius } from './buurt/helpers';
import { fetchMyLocation } from './home';
import { captureMessage } from './monitoring';
import { getLatLngCoordinates } from '../../universal/helpers/bag';
import { MyNotification } from '../../universal/types';

function getNotification(containerID: string) {
  return {
    id: 'adoptable-trash-container-notification',
    datePublished: new Date().toISOString(),
    thema: Themas.BUURT,
    title: 'Adopteer een afvalcontainer',
    description: `Help mee om uw eigen buurt schoon te houden en adopteer een afvalcontainer.
 Liever op een andere manier bijdragen? Leen dan een afvalgrijper!`,
    link: {
      to: `http://localhost:3000/buurt?datasetIds=%5B%22afvalcontainers%22%5D&zoom=15&filters=&loadingFeature=%7B%22datasetId%22%3A%22afvalcontainers%22%2C%22id%22%3A%22${containerID}%22%7D&s=1`,
      title: 'Bekijk de werkzaamheden op kaart',
    },
  };
}

export async function fetchAdoptableTrashContainers(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const datasetId = 'afvalcontainers';
  const config = datasetEndpoints.afvalcontainers;
  const filters = {
    afvalcontainers: {},
  };
  const meldingen = await fetchDataset(requestID, datasetId, config, {}).then(
    (result) => {
      return {
        ...result,
        id: datasetId,
      };
    }
  );
  const MY_LOCATION = await fetchMyLocation(requestID, authProfileAndToken);

  if (
    MY_LOCATION.status === 'OK' &&
    MY_LOCATION.content?.[0]?.latlng &&
    meldingen?.status === 'OK'
  ) {
    // Put all the Lat Lng coordinates in the right order.
    // Because other functions operating on the data expect them in a certain order.
    for (const feature of meldingen.content.features) {
      if (feature.geometry.type === 'Point') {
        const { lat, lng } = getLatLngCoordinates(
          feature.geometry.coordinates as LatLngTuple
        );
        feature.geometry.coordinates = [lat, lng];
      } else {
        captureMessage(`Unexpected geometry type: '${feature.geometry.type}'`, {
          severity: 'error',
        });
      }
    }

    const latlng = MY_LOCATION.content[0].latlng;
    const WITHIN_RADIUS_KM = 0.1;
    const featuresInRadius = filterFeaturesinRadius(
      latlng,
      meldingen.content.features,
      WITHIN_RADIUS_KM
    );

    const filteredFeatures = filterDatasetFeatures(
      featuresInRadius,
      [datasetId],
      filters
    );

    const tips: MyNotification[] =
      FeatureToggle.adopteerbareAfvalContainerMeldingen
        ? filteredFeatures.map((feature) => {
            return getNotification(feature.properties.id);
          })
        : [];

    return apiSuccessResult({ tips });
  }

  return apiDependencyError({ MY_LOCATION });
}
