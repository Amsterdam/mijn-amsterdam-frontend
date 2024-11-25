import { differenceInYears } from 'date-fns';
import { LatLngTuple } from 'leaflet';

import { fetchBRP } from './brp';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import { Themas } from '../../universal/config/thema';
import {
  apiDependencyError,
  ApiResponse,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { AuthProfileAndToken } from '../auth/auth-types';
import { fetchDataset } from './buurt/buurt';
import {
  datasetEndpoints,
  DatasetFeatureProperties,
  DatasetFeatures,
  MaPointFeature,
} from './buurt/datasets';
import { filterDatasetFeatures, filterFeaturesinRadius } from './buurt/helpers';
import { fetchMyLocation } from './home';
import { captureMessage } from './monitoring';
import { getLatLngCoordinates } from '../../universal/helpers/bag';
import { BRPData, MyNotification } from '../../universal/types';

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
    MY_LOCATION.status !== 'OK' ||
    !MY_LOCATION.content?.[0]?.latlng ||
    meldingen?.status !== 'OK'
  ) {
    return apiDependencyError({ MY_LOCATION });
  }

  sortLatLngCoordinates(meldingen.content.features);

  const latlng = MY_LOCATION.content[0].latlng;
  const WITHIN_RADIUS_KM = 0.1;
  const featuresInRadius = filterFeaturesinRadius(
    latlng,
    meldingen.content.features,
    WITHIN_RADIUS_KM
  );

  const filteredFeatures: MaPointFeature<AfvalFeatureProperties>[] =
    filterDatasetFeatures<AfvalFeatureProperties>(
      featuresInRadius,
      [datasetId],
      filters
    ).filter((feature) => {
      return feature.properties.geadopteerd_ind === 'Nee';
    });

  return apiSuccessResult({
    tips: buildNotifications(
      filteredFeatures,
      await fetchBRP(requestID, authProfileAndToken)
    ),
  });
}

/** Put all LatLngCoordinates in the right order. */
function sortLatLngCoordinates(
  features: DatasetFeatures<DatasetFeatureProperties>
): void {
  for (const feature of features) {
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
}

type AfvalFeatureProperties = DatasetFeatureProperties & {
  geadopteerd_ind: 'Ja' | 'Nee';
};

function buildNotifications(
  features: MaPointFeature<AfvalFeatureProperties>[],
  brpResponse: ApiResponse<BRPData>
): MyNotification[] {
  if (!FeatureToggle.adopteerbareAfvalContainerMeldingen) {
    return [];
  }

  if (
    brpResponse.status !== 'OK' ||
    !brpResponse.content.persoon.geboortedatum
  ) {
    return [];
  }

  const birthday = new Date(brpResponse.content.persoon.geboortedatum);

  const descriptionText = determineDescriptionText(birthday);
  if (!descriptionText) {
    return [];
  }

  return features.map((feature) =>
    buildNotification(feature.properties.id, descriptionText)
  );
}

function determineDescriptionText(birthday: Date): string | undefined {
  const age = differenceInYears(new Date(), birthday);
  const ADULT_AGE = 18;
  const LATE_TEEN_AGE = 16;

  if (age >= ADULT_AGE) {
    return `Help mee om uw eigen buurt schoon te houden en adopteer een afvalcontainer.
 Liever op een andere manier bijdragen? Leen dan een afvalgrijper!`;
  } else if (age >= LATE_TEEN_AGE) {
    return `Help mee om je eigen buurt schoon te houden en adopteer een afvalcontainer.
 Wil je liever iets anders doen? Leen dan een afvalgrijper!`;
  }
  return undefined;
}

function buildNotification(
  containerID: string,
  description: string
): MyNotification {
  return {
    id: 'adoptable-trash-container-notification',
    datePublished: new Date().toISOString(),
    thema: Themas.AFVAL,
    title: 'Adopteer een afvalcontainer',
    description,
    link: {
      to: `/buurt?datasetIds=%5B%22afvalcontainers%22%5D&zoom=15&filters=&loadingFeature=%7B%22datasetId%22%3A%22afvalcontainers%22%2C%22id%22%3A%22${containerID}%22%7D&s=1`,
      title: 'Bekijk de werkzaamheden op kaart',
    },
  };
}

export const forTesting = { determineDescriptionText, sortLatLngCoordinates };
