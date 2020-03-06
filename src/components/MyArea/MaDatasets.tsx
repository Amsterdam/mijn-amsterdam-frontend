import useMapData, {
  Dataset,
  DatasetIds,
  DatasetItem,
} from 'hooks/api/api.mapData';
import { useMapInstance } from '@datapunt/react-maps';
import React, { useState, useEffect, useMemo } from 'react';
import { DATASET_GROUP_PANELS } from 'config/Map.constants';
import { DatasetPanel } from './MaDatasetPanel';
import { ClusteredMarkerLayer } from './MaClusteredMarkerLayer';
import styles from './MyArea.module.scss';
import L, { Icon, DivIcon } from 'leaflet';

type MapDatasetIcon = Icon | DivIcon | ((item: any) => Icon | DivIcon);

export interface MapDataset extends Dataset {
  title: string;
  icon: MapDatasetIcon;
  isLoading: boolean;
  isActive: boolean;
}

export interface MapDatasetItem extends DatasetItem {
  icon: MapDatasetIcon;
}

const activeDatasetIdsInitial = DATASET_GROUP_PANELS.reduce((acc, panel) => {
  const activeDatasetIds = panel.datasets
    .filter(dataset => dataset.isActive)
    .map(dataset => dataset.id);

  return Object.assign(acc, {
    [panel.id]: activeDatasetIds,
  });
}, {});

// function getBoundingBox(map: L.Map | null) {
//   if (!map) {
//     return null;
//   }
//   const [lng1, lat1, lng2, lat2] = map
//     .getBounds()
//     .toBBoxString()
//     .split(',');
//   return [lat1, lng1, lat2, lng2].join(',');
// }

export function Datasets() {
  const map = useMapInstance();
  const datasetGroups = useMapData();
  const [activeDatasetIds, setActiveDatasetIds] = useState<{
    [groupId: string]: DatasetIds;
  }>(activeDatasetIdsInitial);

  const mapDatasetGroups = useMemo(() => {
    const mapDatasetGroups: Record<string, MapDataset[]> = {};
    for (const panelData of DATASET_GROUP_PANELS) {
      const datasetGroup = datasetGroups[panelData.id];
      mapDatasetGroups[panelData.id] = panelData.datasets.map(dataset => {
        return Object.assign(
          dataset,
          datasetGroup.datasets.find(
            panelDataset => dataset.id === panelDataset.id
          ) || {},
          {
            isActive: activeDatasetIds[panelData.id].includes(dataset.id),
            isLoading: datasetGroup.datasetIdsLoading.includes(dataset.id),
          }
        ) as MapDataset;
      });
    }
    return mapDatasetGroups;
  }, [datasetGroups, activeDatasetIds]);

  const datasetIconsById = useMemo(() => {
    const datasetIconsById: Record<DatasetItem['id'], MapDatasetIcon> = {};
    for (const dataset of DATASET_GROUP_PANELS.flatMap(
      panel => panel.datasets
    )) {
      datasetIconsById[dataset.id] = dataset.icon;
    }
    return datasetIconsById;
  }, []);

  function toggleActiveDatasetIds(panelId: string, datasetIds: string[]) {
    setActiveDatasetIds({ ...activeDatasetIds, [panelId]: datasetIds });
  }

  // useEffect(() => {
  //   if (map) {
  //     const setBBox = () => {
  //       console.log('meh');

  //     };
  //     let curZoom = map.getZoom();
  //     const onZoomEnd = (event: any) => {
  //       if (map.getZoom() < curZoom) {
  //         console.log('from', curZoom, 'to', map.getZoom());
  //         setBBox();
  //       }
  //     };
  //     const onZoomStart = (event: any) => {
  //       curZoom = map.getZoom();
  //     };

  //     map.addEventListener('load', setBBox);
  //     map.addEventListener('zoomstart', onZoomStart);
  //     map.addEventListener('zoomend', onZoomEnd);
  //     return () => {
  //       map.removeEventListener('load', setBBox);
  //       map.removeEventListener('zoomend', onZoomEnd);
  //       map.removeEventListener('zoomstart', onZoomStart);
  //     };
  //   }
  // }, [map]);

  useEffect(() => {
    if (!map) {
      return;
    }
    Object.entries(datasetGroups).forEach(
      ([groupId, { refetch, datasetIdsLoading, datasets }]) => {
        const idsToLoad = activeDatasetIds[groupId].filter(
          id =>
            !datasetIdsLoading.includes(id) &&
            !datasets.some(dataset => dataset.id === id)
        );
        if (idsToLoad.length) {
          refetch(idsToLoad);
        }
      }
    );
  }, [activeDatasetIds, datasetGroups, map]);

  const activePanelDatasetItems: Array<[
    string,
    MapDatasetItem[]
  ]> = useMemo(() => {
    return Object.entries(datasetGroups).map(([groupId, { datasets }]) => {
      const items = datasets
        .filter(dataset => activeDatasetIds[groupId].includes(dataset.id))
        .flatMap((dataset: Dataset) =>
          dataset.items.map(item => ({
            ...item,
            icon: datasetIconsById[dataset.id],
          }))
        );
      return [groupId, items];
    });
  }, [datasetGroups, activeDatasetIds, datasetIconsById]);

  return (
    <>
      <aside className={styles.DatasetPanelContainer}>
        {DATASET_GROUP_PANELS.map(panel => {
          return (
            <DatasetPanel
              {...panel}
              datasets={mapDatasetGroups[panel.id]}
              key={panel.id}
              onToggleDataset={datasetIds => {
                toggleActiveDatasetIds(panel.id, datasetIds);
              }}
            />
          );
        })}
      </aside>
      {activePanelDatasetItems.map(([panelId, items]) => (
        <ClusteredMarkerLayer key={panelId} items={items} />
      ))}
    </>
  );
}
