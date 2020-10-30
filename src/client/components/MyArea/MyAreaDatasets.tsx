import React, { useCallback, useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { BFFApiUrls } from '../../config/api';
import { MyAreaPolyLineDatasets } from './MyAreaPolyLineDatasets';
import { MaSuperClusterLayer } from './MyAreaSuperCluster';
import { LeafletMouseEventHandlerFn } from 'leaflet';
import { ApiResponse } from '../../../universal/helpers/api';
import { DatasetCollection } from '../../../server/services/buurt/datasets';
import {
  MaPolyLineFeature,
  MaPointFeature,
} from '../../../server/services/buurt/datasets';
import { useMapInstance } from '@amsterdam/react-maps';
import { useActiveDatasetIds } from './MyArea.hooks';

interface MyAreaDatasetsProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
}

export function MyAreaDatasets({ onMarkerClick }: MyAreaDatasetsProps) {
  const map = useMapInstance();
  const [polyLineFeatures, setPolyLineFeatures] = useState<MaPolyLineFeature[]>(
    []
  );
  const [clusterFeatures, setClusterFeatures] = useState<MaPointFeature[]>([]);
  const activeDatasetIds = useActiveDatasetIds();

  const requestData = useCallback(async (payload = {}) => {
    const response: AxiosResponse<ApiResponse<DatasetCollection>> = await axios(
      {
        url: BFFApiUrls.MAP_DATASETS,
        data: payload,
        method: 'POST',
      }
    );
    const clusterFeatures = response.data.content?.filter(
      (feature): feature is MaPointFeature => feature.geometry.type === 'Point'
    );
    const polyLineFeatures = response.data.content?.filter(
      (feature): feature is MaPolyLineFeature =>
        feature.geometry.type === 'MultiPolygon' ||
        feature.geometry.type === 'MultiLineString'
    );

    if (clusterFeatures) {
      setClusterFeatures(clusterFeatures);
    }
    if (polyLineFeatures) {
      setPolyLineFeatures(polyLineFeatures);
    }
  }, []);

  const fetchDatasetCollection = useCallback(
    (datasetIds: string[]) => {
      if (!map) {
        return;
      }
      const bounds = map.getBounds();
      requestData({
        datasetIds,
        bbox: [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ],
        zoom: map.getZoom(),
      });
    },
    [map, requestData]
  );

  useEffect(() => {
    fetchDatasetCollection(activeDatasetIds);
  }, [activeDatasetIds, fetchDatasetCollection]);

  return (
    <>
      <MyAreaPolyLineDatasets
        features={polyLineFeatures}
        onMarkerClick={onMarkerClick}
      />
      <MaSuperClusterLayer
        features={clusterFeatures}
        onUpdate={() => fetchDatasetCollection(activeDatasetIds)}
        onMarkerClick={onMarkerClick}
      />
      {/* <MyAreaClusterDatasets onMarkerClick={onMarkerClick} /> */}
    </>
  );
}
