import { MarkerClusterGroup } from '@amsterdam/arm-cluster';
import { themeColor } from '@amsterdam/asc-ui';
import L, { LeafletMouseEventHandlerFn } from 'leaflet';
import React, { useEffect, useMemo, useState } from 'react';
import { atom } from 'recoil';
import { createGlobalStyle } from 'styled-components';
import { DatasetItemTuple } from '../../../server/services/buurt/datasets';
import { apiPristineResult, ApiResponse } from '../../../universal/helpers/api';
import { BFFApiUrls } from '../../config/api';
import { useDataApi } from '../../hooks/api/useDataApi';
import { Datasets, DatasetsSource, getIconHtml, LayerType } from './datasets';
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

  .ma-marker-selected {
    outline: 4px solid blue;
  }
`;

function createDatasetMarkers(datasetsSources: DatasetsSource[]): Datasets[] {
  return datasetsSources.map((datasetSource) => {
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
  datasetItemId: string;
  markerData: any;
}

export const selectedMarkerDataAtom = atom<SelectedMarkerData | null>({
  key: 'selectedMarkerData',
  default: null,
});

interface MyAreaDatasetsProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
}

export function useActiveDatasetIds() {
  const datasetControlItems = useDatasetControlItems();
  const activeDatasetIds: string[] = useMemo(() => {
    return datasetControlItems.flatMap((datasetControlItem) =>
      datasetControlItem.collection
        .filter((dataset) => dataset.isActive)
        .map((dataset) => dataset.id)
    );
  }, [datasetControlItems]);

  return activeDatasetIds;
}

export function useActiveClusterDatasetIds() {
  const datasetControlItems = useDatasetControlItems();
  const activeDatasetIds: string[] = useMemo(() => {
    return datasetControlItems.flatMap((datasetControlItem) =>
      datasetControlItem.collection
        .filter(
          (dataset) =>
            dataset.isActive && dataset.layerType === LayerType.Cluster
        )
        .map((dataset) => dataset.id)
    );
  }, [datasetControlItems]);

  return activeDatasetIds;
}

export default function MyAreaDatasets({ onMarkerClick }: MyAreaDatasetsProps) {
  const activeDatasetIds = useActiveClusterDatasetIds();
  const activeDatasetIdsString = activeDatasetIds.join(',');
  const [
    {
      data: { content: datasetsSource },
    },
    fetchDatasets,
  ] = useDataApi<ApiResponse<DatasetsSource[]>>(
    {
      url: BFFApiUrls.MAP_DATASETS,
      postpone: true,
    },
    apiPristineResult(null)
  );

  useEffect(() => {
    fetchDatasets({
      url: BFFApiUrls.MAP_DATASETS,
      postpone: false,
    });
  }, [fetchDatasets]);

  const [clusterLayer, setClusterLayer] = useState<L.Layer | null>(null);

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
    return getFilteredMarkers(datasets, activeDatasetIdsString.split(','));
  }, [datasets, activeDatasetIdsString]);

  useEffect(() => {
    if (!clusterLayer || !onMarkerClick) {
      return;
    }

    clusterLayer.on('click', onMarkerClick);

    return () => {
      clusterLayer.off('click', onMarkerClick);
    };
  }, [clusterLayer, onMarkerClick]);

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
