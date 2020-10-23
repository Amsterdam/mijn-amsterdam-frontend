import axios from 'axios';
import L, { LeafletMouseEventHandlerFn } from 'leaflet';
import { useCallback, useEffect, useMemo } from 'react';
import { BFFApiUrls } from '../../config/api';
import { createMarkerIcon, getIconHtml } from './datasets';
import { useActiveClusterDatasetIds } from './MyArea.hooks';
import datasetStyles from './MyAreaSuperCluster.module.scss';
import { useMapRef } from './useMap';

function createMarker(feature: any, latlng: any) {
  let icon;
  if (!feature?.properties.cluster) {
    const html = getIconHtml(feature.properties.dataset[1]);
    icon = L.divIcon({
      html,
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  } else {
    const count = feature.properties.point_count;
    const size = count < 100 ? 'small' : count < 1000 ? 'medium' : 'large';
    const label = feature.properties.point_count_abbreviated;
    icon = createMarkerIcon({
      label,
      className: datasetStyles[`MarkerIcon--${size}`],
    });
  }

  return L.marker(latlng, { icon });
}

function useClusterMarkers(map: L.Map | null) {
  const layer = useMemo(() => {
    if (!map) {
      return;
    }
    const layer = L.geoJSON(undefined, {
      pointToLayer: createMarker,
    }).addTo(map);

    return layer;
  }, [map]);

  return layer;
}

interface MaSuperClusterLayerProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
}

export function MaSuperClusterLayer({
  onMarkerClick,
}: MaSuperClusterLayerProps) {
  const map = useMapRef().current;
  const markers = useClusterMarkers(map);
  const activeDatasetIds = useActiveClusterDatasetIds();

  useEffect(() => {
    return () => {
      if (markers?.remove) {
        markers.remove();
      }
    };
  }, [markers]);

  const updateMap = useCallback(
    (response) => {
      if (!map || !markers) {
        return;
      }
      if (response.expansionZoom) {
        map.setZoomAround(response.center, response.expansionZoom);
      } else if (response.children) {
        console.log('children', response.children);
      } else if (response.data) {
        markers.clearLayers();
        markers.addData(response.data);
      }
      console.timeEnd('update cluster data');
    },
    [map, markers]
  );

  const requestData = useCallback(
    async (payload = {}) => {
      // TODO: put in serviceworker?
      const response = await axios({
        url: BFFApiUrls.MAP_DATASETS,
        data: payload,
        method: 'POST',
      });
      updateMap(response.data);
    },
    [updateMap]
  );

  const updateClusterData = useCallback(() => {
    if (!map) {
      return;
    }
    console.time('update cluster data');
    const bounds = map.getBounds();
    requestData({
      datasetIds: activeDatasetIds.map(([, datasetId]) => datasetId),
      bbox: [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ],
      zoom: map.getZoom(),
    });
  }, [map, activeDatasetIds, requestData]);

  useEffect(() => {
    if (!map) {
      return;
    }
    map.on('moveend', updateClusterData);
    return () => {
      map.off('moveend', updateClusterData);
    };
  }, [map, updateClusterData]);

  useEffect(() => {
    if (!markers || !map) {
      return;
    }

    const onClick = (event: any) => {
      const point = event.latlng;
      // Request new cluster data
      if (event.layer.feature.properties.cluster_id) {
        const center = [point.lat, point.lng];
        requestData({
          getClusterExpansionZoom: event.layer.feature.properties.cluster_id,
          center,
          datasetIds: activeDatasetIds,
        });
      }
      onMarkerClick && onMarkerClick(event);
    };

    markers.on('click', onClick);

    return () => {
      markers.off('click', onClick);
    };
  }, [markers, requestData, map, activeDatasetIds, onMarkerClick]);

  useEffect(() => {
    if (updateClusterData) {
      updateClusterData();
    }
  }, [updateClusterData]);

  return null;
}
