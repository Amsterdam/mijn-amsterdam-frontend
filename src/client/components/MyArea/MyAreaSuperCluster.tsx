import { useMapInstance } from '@amsterdam/react-maps';
import classnames from 'classnames';
import L, {
  LatLngLiteral,
  LeafletMouseEvent,
  LeafletMouseEventHandlerFn,
} from 'leaflet';
import { useCallback, useEffect, useMemo } from 'react';
import type {
  DatasetFeatureProperties,
  MaSuperClusterFeature,
} from '../../../server/services/buurt/datasets';
import { getIconHtml } from './dataset-icons';
import { processFeatures } from './MyArea.helpers';
import styles from './MyAreaDatasets.module.scss';

function createClusterMarker(
  feature: MaSuperClusterFeature,
  latlng: LatLngLiteral
) {
  let icon;
  if (!feature?.properties.cluster) {
    const html = getIconHtml(feature);
    icon = L.divIcon({
      html: `<div role="button" aria-label="Toon meer informatie over ${feature.properties.datasetId} met id ${feature.properties.id}." class="${styles.MarkerClusterIconLabel}">${html}</div>`,
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
      html: `<div role="button" aria-label="Zoom in op ${label} locaties op de kaart." class="${styles.MarkerClusterIconLabel}">${label}</div>`,
      iconAnchor: [20, 20],
    });
  }

  return L.marker(latlng, { icon, keyboard: true });
}

interface MaSuperClusterLayerProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
  features: MaSuperClusterFeature[];
}

export function MaSuperClusterLayer({
  onMarkerClick,
  features,
}: MaSuperClusterLayerProps) {
  const map = useMapInstance();

  const markerLayer = useMemo(() => {
    const layer = L.geoJSON<DatasetFeatureProperties>(undefined, {
      pointToLayer: (feature: MaSuperClusterFeature, latlng: LatLngLiteral) =>
        createClusterMarker(feature, latlng),
      attribution:
        '<a href="https://api.data.amsterdam.nl/v1/docs">Amsterdam DSO api</a>',
    });

    return layer;
  }, []);

  const onClick = useCallback(
    (event: LeafletMouseEvent) => {
      if (event.propagatedFrom.feature.properties.cluster_id) {
        map.setZoomAround(
          event.latlng || (event as any)._latlng,
          event.propagatedFrom.feature.properties.expansion_zoom
        );
      }
      onMarkerClick && onMarkerClick(event);
    },
    [onMarkerClick, map]
  );

  const onKeyup = useCallback(
    (event: any) => {
      if (event.originalEvent.key === 'Enter') {
        event.latlng = event.layer.getLatLng();
        onClick(event);
      }
    },
    [onClick]
  );

  const clusterFeatures = useMemo(() => {
    // Pre process the features before they get added to the map.
    // Some features have the exact same coordinates therefor markers become indistinguishable if we don't modify the coordinates a bit.
    return processFeatures(map, features);
  }, [map, features]);

  useEffect(() => {
    if (!clusterFeatures.length) {
      return;
    }

    markerLayer.clearLayers();

    if (markerLayer && clusterFeatures.length) {
      markerLayer.addTo(map);
      markerLayer.addData(clusterFeatures as any); // Type mismatch here.
      markerLayer.on('click', onClick);
      markerLayer.on('keyup', onKeyup);
    }

    return () => {
      if (markerLayer) {
        markerLayer.off('click', onClick);
        markerLayer.off('keyup', onKeyup);
        markerLayer.remove();
      }
    };
  }, [markerLayer, clusterFeatures, onClick, map, onKeyup]);

  return null;
}
