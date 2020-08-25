import { MarkerClusterGroup } from '@datapunt/arm-cluster';
import { themeColor } from '@datapunt/asc-ui';
import L, { LatLngTuple, Marker } from 'leaflet';
import React, { useEffect, useMemo, useState } from 'react';
import { createGlobalStyle } from 'styled-components';
import { apiPristineResult, ApiResponse } from '../../../universal/helpers/api';
import { useDataApi } from '../../hooks/api/useDataApi';
import { getIconHtml, Datasets, DatasetsSource } from './datasets';
import { useDatasetControlItems } from './MyAreaDatasetControl';
import axios from 'axios';
import { DatasetItemTuple } from '../../../server/services';
import { atom, useRecoilState } from 'recoil';

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
          ([datasetId, datasetItems]) => {
            return [
              datasetId,
              datasetItems.map((datasetItemTuple) =>
                createMarker(datasetSource.id, datasetId, datasetItemTuple)
              ),
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

function createMarker(
  datasetGroupId: string,
  datasetId: string,
  datasetItem: DatasetItemTuple
) {
  const [lat, lng, datasetItemId] = datasetItem;
  const html = getIconHtml(datasetId);
  const icon = L.divIcon({
    html,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
  return L.marker(new L.LatLng(lat, lng), {
    icon,
    datasetItemId,
    datasetId,
    datasetGroupId,
  } as any);
}

interface SelectedMarkerData {
  datasetGroupId: string;
  datasetId: string;
  markerData: any;
}

export const selectedMarkerDataAtom = atom<SelectedMarkerData | null>({
  key: 'selectedMarkerData',
  default: null,
});

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

  const [clusterLayer, setClusterLayer] = useState<L.Layer | null>(null);
  const [selectedMarkerData, setSelectedMarkerData] = useRecoilState(
    selectedMarkerDataAtom
  );

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

  useEffect(() => {
    if (clusterLayer) {
      clusterLayer?.on('click', (event: any) => {
        console.log('event click', event.layer.options.datasetItemId);
        axios({
          url: `/test-api/bff/map/datasets/${event.layer.options.datasetGroupId}/${event.layer.options.datasetItemId}`,
        })
          .then(({ data: { content: markerData } }) => {
            setSelectedMarkerData({
              datasetGroupId: event.layer.options.datasetGroupId,
              datasetId: event.layer.options.datasetId,
              markerData,
            });
          })
          .catch((error) => {
            console.error('request error', error);
          });
      });
    }
    return () => {
      if (clusterLayer) {
        clusterLayer?.off('click');
      }
    };
  }, [clusterLayer, setSelectedMarkerData]);

  return (
    <>
      <Styles />
      <MarkerClusterGroup
        optionsOverrides={options}
        markers={markers}
        setInstance={setClusterLayer}
      />
    </>
  );
}
