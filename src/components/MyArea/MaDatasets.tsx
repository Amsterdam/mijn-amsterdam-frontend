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
import L, { Icon } from 'leaflet';

export interface MapDataset extends Dataset {
  title: string;
  iconUrl: string;
  isLoading: boolean;
  isActive: boolean;
}

export interface MapDatasetItem extends DatasetItem {
  icon: Icon;
}

const activeDatasetIdsInitial = DATASET_GROUP_PANELS.reduce((acc, panel) => {
  const activeDatasetIds = panel.datasets
    .filter(dataset => dataset.isActive)
    .map(dataset => dataset.id);

  return Object.assign(acc, {
    [panel.id]: activeDatasetIds,
  });
}, {});

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
    const datasetIconsById: Record<DatasetItem['id'], Icon> = {};
    for (const dataset of DATASET_GROUP_PANELS.flatMap(
      panel => panel.datasets
    )) {
      datasetIconsById[dataset.id] = L.icon({
        iconUrl: dataset.iconUrl,
      });
    }
    return datasetIconsById;
  }, []);

  function toggleActiveDatasetIds(panelId: string, datasetIds: string[]) {
    setActiveDatasetIds({ ...activeDatasetIds, [panelId]: datasetIds });
  }

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
          const [lng1, lat1, lng2, lat2] = map
            .getBounds()
            .toBBoxString()
            .split(',');
          const bbox = [lat1, lng1, lat2, lng2].join(',');
          refetch(idsToLoad, {
            bbox,
          });
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
