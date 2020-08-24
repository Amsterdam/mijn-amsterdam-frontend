import { MarkerClusterGroup } from '@datapunt/arm-cluster';
import { themeColor } from '@datapunt/asc-ui';
import L, { LatLngTuple, Marker } from 'leaflet';
import React, { useEffect, useMemo } from 'react';
import { createGlobalStyle } from 'styled-components';
import { apiPristineResult, ApiResponse } from '../../../universal/helpers/api';
import { useDataApi } from '../../hooks/api/useDataApi';
import { getIconHtml, Datasets, DatasetsSource } from './datasets';
import { useDatasetControlItems } from './MyAreaDatasetControl';

const iconCreateFunction = (
  marker: L.Marker & { getChildCount: () => number }
) => {
  return L.divIcon({
    html: `
            <div
              class="arm__icon-text"
              aria-label="Cluster met ${marker.getChildCount()} markers"
            >
              ${marker.getChildCount()}
            </div>
            `,
    className: 'arm__icon--clustergroup-ma',
    iconSize: L.point(39, 39),
    iconAnchor: L.point(19, 19),
  });
};

const options = {
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  maxClusterRadius: 120,
  chunkedLoading: true,
  disableClusteringAtZoom: 16,
  iconCreateFunction,
};

const Styles = createGlobalStyle`
  .arm__icon--clustergroup-ma {
    background-color: ${themeColor('primary')};
    border-radius: 50%;
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: zoom-in;

    .arm__icon-text {
      text-align:center;
    }
  }
`;

function createDatasetMarkers(datasetsSource: DatasetsSource[]): Datasets[] {
  return datasetsSource.map((datasetSource) => {
    return {
      ...datasetSource,
      collection: Object.fromEntries(
        Object.entries(datasetSource.collection).map(
          ([datasetId, coordinates]) => {
            return [
              datasetId,
              coordinates.map((latLng) => createMarker(datasetId, latLng)),
            ];
          }
        )
      ),
    };
  });
}

function getFilteredMarkers(datasets: Datasets[], activeDatasetIds: string[]) {
  return datasets.flatMap((dataset) =>
    Object.entries(dataset.collection)
      .filter(([id]) => {
        return activeDatasetIds.includes(id);
      })
      .flatMap(([datasetId, markers]) => markers)
  );
}

function createMarker(datasetId: string, coordinates: LatLngTuple) {
  const [lat, lng] = coordinates;
  const html = getIconHtml(datasetId);
  const icon = L.divIcon({
    html,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
  return L.marker(new L.LatLng(lat, lng), { icon });
}

export default function MyAreaDatasets() {
  const datasetControlItems = useDatasetControlItems();
  const [
    {
      data: { content: datasetsSource },
    },
    fetchDatasets,
  ] = useDataApi<ApiResponse<DatasetsSource[]>>(
    {
      url: '/test-api/bff/map/datasets',
      postpone: true,
    },
    apiPristineResult(null)
  );

  useEffect(() => {
    fetchDatasets({ url: '/test-api/bff/map/datasets', postpone: false });
  }, []);

  const activeDatasetIds: string[] = useMemo(() => {
    return datasetControlItems.flatMap((datasetControlItem) =>
      datasetControlItem.collection
        .filter((dataset) => dataset.isActive)
        .map((dataset) => dataset.id)
    );
  }, [datasetControlItems]);

  const datasets = useMemo(() => {
    if (!datasetsSource) {
      return [];
    }
    return createDatasetMarkers(datasetsSource);
  }, [datasetsSource]);

  const markers = useMemo(() => {
    if (!datasets) {
      return [];
    }
    return getFilteredMarkers(datasets, activeDatasetIds);
  }, [datasets, activeDatasetIds]);

  return (
    <>
      <Styles />
      <MarkerClusterGroup optionsOverrides={options} markers={markers} />
    </>
  );
}
