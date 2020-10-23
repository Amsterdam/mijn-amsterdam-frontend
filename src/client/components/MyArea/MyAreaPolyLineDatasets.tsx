import { LeafletMouseEventHandlerFn } from 'leaflet';
import React, { useEffect, useMemo } from 'react';
import { createGlobalStyle } from 'styled-components';
import { BFFApiUrls } from '../../config/api';
import { PARKEERZONES_POLYLINE_OPTIONS, POLYLINE_DATASETS } from './datasets';
import { MaPolyLineFeature, MaPolyLineLayer } from './MaPolyLineLayer';
import { useActivePolyLineDatasetIds, useDatasetGroups } from './MyArea.hooks';

const Styles = createGlobalStyle`
  .ma-marker-tooltip {
    background: none;
    border: 0;
    color: white;
    text-shadow:
    -1px -1px 0 #000,
     0   -1px 0 #000,
     1px -1px 0 #000,
     1px  0   0 #000,
     1px  1px 0 #000,
     0    1px 0 #000,
    -1px  1px 0 #000,
    -1px  0   0 #000;
    font-size: 16px;
    font-weight: 500;
    box-shadow: none;
  }
`;

interface MyAreaPolyLineDatasetsProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
}

export function MyAreaPolyLineDatasets({
  onMarkerClick,
}: MyAreaPolyLineDatasetsProps) {
  const [datasetGroups, fetchDatasets] = useDatasetGroups();
  const activePolyLineDatasetIds = useActivePolyLineDatasetIds();

  useEffect(() => {
    if (!datasetGroups.length) {
      return;
    }
    const loadedIds = datasetGroups.flatMap((datasetGroup) =>
      Object.keys(datasetGroup.collection).map((datasetId) => [
        datasetGroup.id,
        datasetId,
      ])
    );
    const datasetIdsToLoad = activePolyLineDatasetIds.filter(
      ([, datasetId]) =>
        !loadedIds.some(([, datasetIdLoaded]) => datasetIdLoaded === datasetId)
    );
    if (datasetIdsToLoad.length) {
      fetchDatasets({
        url: `${BFFApiUrls.MAP_DATASETS}/${datasetIdsToLoad[0][0]}/${datasetIdsToLoad[0][1]}`,
      });
    }
  }, [datasetGroups, activePolyLineDatasetIds, fetchDatasets]);

  const polyLineLayerData = useMemo<Record<string, MaPolyLineFeature[]>>(() => {
    return {};
  }, []);

  const activePolyLineDatasets = useMemo(() => {
    return POLYLINE_DATASETS.filter(([, datasetId]) => {
      return (
        activePolyLineDatasetIds.some(
          ([, datasetIdPolyLIne]) => datasetIdPolyLIne === datasetId
        ) && Array.isArray(polyLineLayerData[datasetId])
      );
    });
  }, [activePolyLineDatasetIds, polyLineLayerData]);

  return (
    <>
      {activePolyLineDatasets.map(([datasetGroupId, datasetId]) => {
        return (
          <MaPolyLineLayer
            key={datasetId}
            features={polyLineLayerData[datasetId]}
            polylineOptions={PARKEERZONES_POLYLINE_OPTIONS[datasetId]}
            datasetId={datasetId}
            datasetGroupId={datasetGroupId}
            onMarkerClick={onMarkerClick}
          />
        );
      })}
      <Styles></Styles>
    </>
  );
}
