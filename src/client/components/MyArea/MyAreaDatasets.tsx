import { MarkerClusterGroup } from '@datapunt/arm-cluster';
import React, { useEffect, useMemo } from 'react';
import { apiPristineResult } from '../../../universal/helpers/api';
import { useDataApi } from '../../hooks/api/useDataApi';
import { useDatasetControlItems } from './MyAreaDatasetControl';

const options = {
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  maxClusterRadius: 120,
  chunkedLoading: true,
  disableClusteringAtZoom: 16,
};

export default function MyAreaDatasets() {
  const datasetControlItems = useDatasetControlItems();
  const [
    {
      data: { content: datasets },
    },
    fetchDatasets,
  ] = useDataApi<any>(
    {
      url: '/test-api/bff/map/datasets',
      postpone: true,
    },
    apiPristineResult(null)
  );

  useEffect(() => {
    console.log('bliep!');
    fetchDatasets({ url: '/test-api/bff/map/datasets', postpone: false });
  }, []);

  const activeDatasetIds = useMemo(() => {
    return datasetControlItems.flatMap((item) =>
      item.datasets
        .filter((dataset) => dataset.isActive)
        .map((dataset) => dataset.id)
    );
  }, [datasetControlItems]);

  const markers = useMemo(() => {
    if (!datasets) {
      return null;
    }

    return datasets.flatMap((dataset: any) =>
      Object.entries(dataset.datasets)
        .filter(([id]) => {
          return activeDatasetIds.includes(id);
        })
        .flatMap(([, coordinates]) => coordinates)
    );
  }, [datasets, activeDatasetIds]);

  return <MarkerClusterGroup optionsOverrides={options} markers={markers} />;
}
