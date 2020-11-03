import { useMapInstance } from '@amsterdam/react-maps';
import L, {
  LeafletEventHandlerFn,
  LeafletMouseEvent,
  LeafletMouseEventHandlerFn,
} from 'leaflet';
import { useCallback, useEffect, useMemo } from 'react';
import {
  MaSuperClusterFeature,
  DatasetFeatureProperties,
} from '../../../server/services/buurt/datasets';
import { createMarkerIcon, getIconHtml } from './datasets';
import styles from './MyAreaSuperCluster.module.scss';

function createMarker(feature: MaSuperClusterFeature, latlng: LatLngObject) {
  let icon;
  if (!feature?.properties.cluster) {
    const html = getIconHtml(feature.properties.datasetId);
    icon = L.divIcon({
      html: `<span class="${styles.pin}"></span>${html}`,
      className: styles.MarkerIcon,
      iconSize: [32, 32],
      iconAnchor: [14, 14],
    });
  } else {
    const count = feature.properties.point_count || 0;
    const size = count < 100 ? 'small' : count < 1000 ? 'medium' : 'large';
    const label = count.toString();
    icon = createMarkerIcon({
      label,
      className: styles[`MarkerClusterIcon--${size}`],
    });
  }

  return L.marker(latlng, { icon });
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

function round(num: number, decimalPlaces: number = 6) {
  const num2 = Math.round(((num + 'e' + decimalPlaces) as unknown) as number);
  return Number(num2 + 'e' + -decimalPlaces);
}

type SuperClusterFeatures = MaSuperClusterFeature[];

function processFeatures(features: SuperClusterFeatures) {
  const items: Record<string, SuperClusterFeatures> = {};
  const markersFinal: SuperClusterFeatures = [];

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

  for (const [, features] of Object.entries(items)) {
    // No point modification needed
    if (features.length === 1) {
      markersFinal.push(features[0]);
    } else {
      const [lng, lat] = features[0].geometry.coordinates;
      const pts = coordinateCircle(
        {
          lat,
          lng,
        },
        features.length
      );
      const modifiedMarkers = pts
        .filter((pt, index) => !!features[index])
        .map((pt, index) => {
          const feature: MaSuperClusterFeature = {
            ...features[index],
            geometry: {
              coordinates: pt,
              type: 'Point',
            },
          };
          return feature;
        });
      markersFinal.push(...modifiedMarkers);
    }
  }

  return markersFinal;
}

interface MaSuperClusterLayerProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
  onUpdate: LeafletEventHandlerFn;
  features: SuperClusterFeatures;
}

export function MaSuperClusterLayer({
  onMarkerClick,
  onUpdate,
  features,
}: MaSuperClusterLayerProps) {
  const map = useMapInstance();
  const markerLayer = useMemo(() => {
    const layer = L.geoJSON<DatasetFeatureProperties>(undefined, {
      pointToLayer: createMarker,
    });

    return layer;
  }, []);

  const onClick = useCallback(
    (event: LeafletMouseEvent) => {
      if (event.propagatedFrom.feature.properties.cluster_id) {
        map.setZoomAround(
          event.latlng,
          event.propagatedFrom.feature.properties.expansion_zoom
        );
      }
      onMarkerClick && onMarkerClick(event);
    },
    [onMarkerClick, map]
  );

  const clusterFeatures = useMemo(() => {
    return processFeatures(features);
  }, [features]);

  useEffect(() => {
    if (markerLayer && clusterFeatures.length) {
      markerLayer.addTo(map);
      markerLayer.clearLayers();
      markerLayer.addData(clusterFeatures as any); // Type mismatch here.
      markerLayer.on('click', onClick);
    }

    if (map) {
      map.on('moveend', onUpdate);
      // map.on('zoomstart', () => {
      //   markerLayer.eachLayer((layer: any) => {
      //     layer.getElement().style.visibility = 'hidden';
      //   });
      // });
    }

    return () => {
      if (markerLayer) {
        markerLayer.off('click', onClick);
        markerLayer.remove();
      }
      if (map) {
        map.off('moveend', onUpdate);
      }
    };
  }, [markerLayer, clusterFeatures, onClick, map, onUpdate]);

  return null;
}
