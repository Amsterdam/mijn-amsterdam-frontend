import { LatLngBoundsLiteral } from 'leaflet';

import { FeatureToggle } from '../../universal/config/feature-toggles';
import { Themas } from '../../universal/config/thema';
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
import { fetchMyLocation } from './home';

const WITHIN_RADIUS_KM = 0.1;

function getNotification(bbox: LatLngBoundsLiteral) {
  return {
    id: 'adoptable-trash-container-notification',
    datePublished: new Date().toISOString(),
    thema: Themas.BUURT,
    title: 'Adopteer een afvalcontainer',
    description: `Help mee om uw eigen buurt schoon te houden en adopteer een afvalcontainer.
 Liever op een andere manier bijdragen? Leen dan een afvalgrijper!`,
    link: {
      // RP TODO: Change link to aim at trash container
      to: `/buurt?datasetIds=["wior"]&filters={"wior":{"datumStartUitvoering":{"values":{"Binnen enkele maanden":1}},"duur":{"values":{"Meerdaags":1}}}}&bbox=[[${bbox[0]}],[${bbox[1]}]]`,
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
    // Take first address
    const latlng = MY_LOCATION.content[0].latlng;
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
    const bbox = getBboxFromFeatures(filteredFeatures, latlng);
    const notification = getNotification(bbox);

    return apiSuccessResult({
      tips:
        FeatureToggle.wiorMeldingen && filteredFeatures.length >= 2
          ? [notification]
          : [],
    });
  }

  return apiDependencyError({ MY_LOCATION });
}
