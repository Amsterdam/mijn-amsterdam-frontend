import { useMapInstance } from '@amsterdam/react-maps';
import L, {
  LatLngLiteral,
  LeafletEventHandlerFn,
  LeafletMouseEvent,
  LeafletMouseEventHandlerFn,
} from 'leaflet';
import { useCallback, useEffect, useMemo } from 'react';
import {
  DatasetFeatureProperties,
  MaSuperClusterFeature,
} from '../../../server/services/buurt/datasets';
import { getIconHtml } from './datasets';
import { processFeatures } from './MyArea.helpers';
import styles from './MyAreaDatasets.module.scss';
import classnames from 'classnames';

function createClusterMarker(
  feature: MaSuperClusterFeature,
  latlng: LatLngLiteral
) {
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

    icon = L.divIcon({
      className: classnames(
        styles.MarkerClusterIcon,
        styles[`MarkerClusterIcon--${size}`]
      ),
      iconSize: [40, 40],
      html: `<span class="${styles.MarkerClusterIconLabel}">${label}</span>`,
      iconAnchor: [20, 20],
    });
  }

  return L.marker(latlng, { icon });
}

interface MaSuperClusterLayerProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
  onUpdate: LeafletEventHandlerFn;
  features: MaSuperClusterFeature[];
}

export function MaSuperClusterLayer({
  onMarkerClick,
  onUpdate,
  features,
}: MaSuperClusterLayerProps) {
  const map = useMapInstance();
  const markerLayer = useMemo(() => {
    const layer = L.geoJSON<DatasetFeatureProperties>(undefined, {
      pointToLayer: createClusterMarker,
      attribution:
        '<a href="https://api.data.amsterdam.nl/v1/docs">Amsterdam DSO api</a>',
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
    // Pre process the features before they get added to the map.
    // Some features have the exact same coordinates therefor markers become indistinguishable if we don't modify the coordinates a bit.
    return processFeatures(map, features);
  }, [map, features]);

  useEffect(() => {
    if (markerLayer && clusterFeatures.length) {
      markerLayer.addTo(map);
      markerLayer.addData(clusterFeatures as any); // Type mismatch here.
      markerLayer.on('click', onClick);
    }

    if (map) {
      map.on('moveend', onUpdate);
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
