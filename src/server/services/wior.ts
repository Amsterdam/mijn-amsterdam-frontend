import { LatLngBoundsLiteral } from 'leaflet';
import { Chapters, FeatureToggle } from '../../universal/config';
import { apiDependencyError, apiSuccesResult } from '../../universal/helpers';
import { fetchDataset } from './buurt/buurt';
import { datasetEndpoints } from './buurt/datasets';
import {
  filterDatasetFeatures,
  filterFeaturesinRadius,
  getBboxFromFeatures,
} from './buurt/helpers';
import { fetchMyLocation } from './home';

function getNotification(bbox: LatLngBoundsLiteral) {
  return {
    id: `wior-meldingen-notification`,
    datePublished: new Date().toISOString(),
    chapter: Chapters.BUURT,
    title: `Werkzaamheden gepland`,
    description: `Bij u in de buurt zijn binnen enkele maanden meerdaagsewerkzaamheden gepland`,
    link: {
      to: `/buurt?datasetIds=["wior"]&filters={"wior":{"datumStartUitvoering":{"values":{"Binnen enkele maanden":1}},"duur":{"values":{"Meerdaags":1}}}}&bbox=[[${bbox[0]}],[${bbox[1]}]]`,
      title: 'Bekijk de werkzaamheden op kaart',
    },
  };
}

export async function fetchWiorGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  profileType: ProfileType
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
  const wiorMeldingen = await fetchDataset(
    sessionID,
    datasetId,
    config,
    {}
  ).then((result) => {
    return {
      ...result,
      id: datasetId,
    };
  });
  const MY_LOCATION = await fetchMyLocation(
    sessionID,
    passthroughRequestHeaders,
    profileType
  );
  if (
    MY_LOCATION.status === 'OK' &&
    MY_LOCATION.content?.latlng &&
    wiorMeldingen?.status === 'OK'
  ) {
    const featuresInRadius = filterFeaturesinRadius(
      MY_LOCATION.content?.latlng,
      wiorMeldingen.content.features,
      1.5
    );
    const filteredFeatures = filterDatasetFeatures(
      featuresInRadius,
      [datasetId],
      filters
    );
    const bbox = getBboxFromFeatures(
      filteredFeatures,
      MY_LOCATION.content?.latlng
    );
    const notification = getNotification(bbox);
    return apiSuccesResult({
      notifications:
        FeatureToggle.wiorMeldingen && filteredFeatures.length >= 2
          ? [notification]
          : [],
    });
  }
  return apiDependencyError({ MY_LOCATION });
}
