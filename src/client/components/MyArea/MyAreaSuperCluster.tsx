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
    const html = getIconHtml(
      feature.properties.dataset[1],
      feature.properties.dataset[2]
    );
    icon = L.divIcon({
      html,
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  } else {
    const count = feature.properties.point_count;
    const size = count < 100 ? 'small' : count < 1000 ? 'medium' : 'large';
    const label = count;
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

function coordinateCircle(
  center: LatLngObject,
  count: number = 21,
  radius: number = 10
) {
  const points = [];
  radius = Math.max(1.3, count / 4);
  const EARTH_RADIUS = 6378100.0;
  const lat = (center.lat * Math.PI) / 180.0;
  const lon = (center.lng * Math.PI) / 180.0;
  const legAngle = (360 * (Math.PI / 180)) / count;

  for (let t = 0; t <= Math.PI * 2; t += legAngle) {
    const latPoint = lat + (radius / EARTH_RADIUS) * Math.sin(t);
    const lonPoint =
      lon + ((radius / EARTH_RADIUS) * Math.cos(t)) / Math.cos(lat);
    const point = [(lonPoint * 180.0) / Math.PI, (latPoint * 180.0) / Math.PI];
    points.push(point);
  }

  return points;
}

function round(num: number, decimalPlaces: number = 10) {
  const num2 = Math.round((num + 'e' + decimalPlaces) as any);
  return Number(num2 + 'e' + -decimalPlaces);
}

function processMarkers(map: L.Map, features: any) {
  const items: any = {};
  const markersFinal: any = [];
  for (const feature of features) {
    if (!feature.properties.cluster) {
      const c = `${round(feature.geometry.coordinates[0])}-${round(
        feature.geometry.coordinates[1]
      )}`;
      if (!items[c]) {
        items[c] = [feature];
      } else {
        items[c].push(feature);
      }
    } else {
      markersFinal.push(feature);
    }
  }

  for (const [coord, features] of Object.entries<any>(items)) {
    if (features.length === 1) {
      markersFinal.push(features[0]);
    } else {
      const pts = coordinateCircle(
        {
          lat: features[0].geometry.coordinates[1],
          lng: features[0].geometry.coordinates[0],
        },
        features.length
      );
      const modifiedMarkers = pts
        .filter((pt, index) => !!features[index])
        .map((pt, index) => {
          return {
            ...features[index],
            geometry: {
              coordinates: pt,
              type: 'Point',
            },
          };
        });
      markersFinal.push(...modifiedMarkers);
    }
  }

  return markersFinal as any;
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

        markers.addData(processMarkers(map, response.data));
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

  const onClick = useCallback(
    (event: any) => {
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
    },
    [onMarkerClick, requestData, activeDatasetIds]
  );

  useEffect(() => {
    if (!markers) {
      return;
    }
    markers.on('click', onClick);
    return () => {
      markers.off('click', onClick);
    };
  }, [markers, onClick]);

  // Fetch initial
  useEffect(() => {
    if (updateClusterData) {
      console.log('effectness!');
      updateClusterData();
    }
  }, [updateClusterData]);

  return null;
}
