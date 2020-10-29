import { MarkerClusterGroup } from '@amsterdam/arm-cluster';
import { themeColor } from '@amsterdam/asc-ui';
import L, { LeafletMouseEventHandlerFn } from 'leaflet';
import React, { useEffect, useMemo, useState } from 'react';
import { createGlobalStyle } from 'styled-components';

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

function getFilteredMarkers(
  markers: L.Marker<any>[],
  activeDatasetIds: string[]
) {
  return markers.filter((marker) => {
    return activeDatasetIds.includes((marker as any).properties.datasetId);
  });
}

interface MyAreaClusterDatasetsProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
}

export default function MyAreaClusterDatasets({
  onMarkerClick,
}: MyAreaClusterDatasetsProps) {
  // const activeClusterDatasetIds = useActiveClusterDatasetIds();
  const [clusterLayer, setClusterLayer] = useState<L.Layer | null>(null);

  // // Fetch initial clusterable datasets
  // useEffect(() => {
  //   if (activeClusterDatasetIds.length) {
  //     fetchDatasets({ url: BFFApiUrls.MAP_DATASETS });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [fetchDatasets]);

  const markers = useMemo(() => [], []);
  //   if (!datasetMarkers || !activeClusterDatasetIdsString) {
  //     return [];
  //   }
  //   return getFilteredMarkers(
  //     datasetMarkers,
  //     activeClusterDatasetIdsString.split(',')
  //   );
  // }, [datasetMarkers, activeClusterDatasetIdsString]);

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
