import { useMapInstance } from '@datapunt/react-maps';
import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce/lib';
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MapDatasetItem } from './MaDatasets';
import styles from './MyArea.module.scss';

const DEFAULT_ICON = L.divIcon({
  className: styles.MarkerIcon,
});

interface ClusteredMarkerLayerProps {
  items: MapDatasetItem[];
}

export function ClusteredMarkerLayer({ items }: ClusteredMarkerLayerProps) {
  const map = useMapInstance();
  const [markerClusterGroup, storeMarkerCluster] = useState<any>(
    (L as any).markerClusterGroup()
  );

  const [createMarkerClusterGroup] = useDebouncedCallback(items => {
    // Apparently clearLayers and re-adding layers is faster https://github.com/Leaflet/Leaflet.markercluster/issues/59#issuecomment-9320628
    markerClusterGroup.clearLayers();
    if (items.length) {
      markerClusterGroup.addLayers(
        items.map((item: any) => {
          return L.marker(item.latLng, {
            title: item.title,
            icon: item.icon
              ? typeof item.icon === 'function'
                ? item.icon(item)
                : item.icon
              : DEFAULT_ICON,
          });
        })
      );

      storeMarkerCluster(markerClusterGroup);
    }
    return null;
  }, 400);

  useEffect(() => {
    createMarkerClusterGroup(items);
  }, [items, createMarkerClusterGroup]);

  useEffect(() => {
    if (markerClusterGroup && map) {
      map.addLayer(markerClusterGroup);
    }
    return () => {
      if (markerClusterGroup && map) {
        map.removeLayer(markerClusterGroup);
      }
    };
  }, [markerClusterGroup, map]);

  return null;
}
