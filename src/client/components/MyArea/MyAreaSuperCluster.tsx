import classnames from 'classnames';
import L, { marker } from 'leaflet';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createMarkerIcon } from './datasets';
import { useDatasetControlItems } from './MyAreaDatasetControl';
import datasetStyles from './MyAreaSuperCluster.module.scss';
import { useMapRef } from './useMap';
//
export const WS_SUPERCLUSTER_SERVER = 'ws://localhost:5013';

function createMarker(feature: any, latlng: any) {
  let icon;
  if (!feature?.properties.cluster) {
    icon = createMarkerIcon({
      label: '1',
      className: classnames(
        datasetStyles[`MarkerIcon-${feature.properties.dataset.join('--')}`]
      ),
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

// TODO: Use GeoJSON layer
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

function useSuperClusterWebSocket(onMessageCallback: (data: any) => void) {
  const ws = useMemo(() => new WebSocket(WS_SUPERCLUSTER_SERVER), []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ws) {
      return;
    }

    const open = () => {
      // console.log('ws:open');
      setReady(true);
    };

    const message = (event: any) => {
      // console.log('ws:message', event);
      onMessageCallback(JSON.parse(event.data));
    };

    ws.addEventListener('open', open);
    ws.addEventListener('message', message);

    return () => {
      ws.removeEventListener('open', open);
      ws.removeEventListener('message', message);
    };
  }, [ws, onMessageCallback]);

  return {
    ws,
    ready,
  };
}

interface MaSuperClusterLayerProps {
  onClickMarker?: (event: any, properties: any) => void;
}

export function MaSuperClusterLayer({
  onClickMarker,
}: MaSuperClusterLayerProps) {
  const map = useMapRef().current;

  const markers = useClusterMarkers(map);
  const datasetControlItems = useDatasetControlItems();
  const activeDatasetIds = useMemo(() => {
    return datasetControlItems.flatMap((item) =>
      item.collection
        .filter((dataset) => dataset.isActive)
        .map((dataset) => dataset.id)
    );
  }, [datasetControlItems]);

  useEffect(() => {
    return () => {
      if (markers) {
        markers?.remove();
      }
    };
  }, [markers]);

  const updateMap = useCallback(
    (response) => {
      // console.log('updaa', response);
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
    },
    [map, markers]
  );

  const { ws, ready: wsReady } = useSuperClusterWebSocket(updateMap);

  const requestData = useCallback(
    (query = {}) => {
      // console.log(ws, query);
      if (ws) {
        ws.send(JSON.stringify(query));
      }
    },
    [ws]
  );

  const updateClusterData = useCallback(() => {
    if (!map) {
      return;
    }
    const bounds = map.getBounds();
    requestData({
      datasetIds: activeDatasetIds,
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
        console.log(map.getZoom(), event.layer.feature);
        if (map.getZoom() === 16) {
          console.log(event.layer.feature);
          requestData({ parentId: event.layer.feature.id });
        } else {
          requestData({
            getClusterExpansionZoom: event.layer.feature.properties.cluster_id,
            center,
            datasetIds: activeDatasetIds,
          });
        }
      }
      onClickMarker && onClickMarker(event, event.layer.feature.properties);
    };

    markers.on('click', onClick);

    return () => {
      markers.off('click', onClick);
    };
  }, [markers, requestData, map, activeDatasetIds, onClickMarker]);

  useEffect(() => {
    if (wsReady && updateClusterData) {
      updateClusterData();
    }
  }, [wsReady, updateClusterData]);

  return null;
}
