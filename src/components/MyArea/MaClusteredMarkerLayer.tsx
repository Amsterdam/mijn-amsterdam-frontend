import { useMapInstance } from '@datapunt/react-maps';
import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce/lib';
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MapDatasetItem } from './MaDatasets';
import styles from './MyArea.module.scss';
import { LOCATION_ZOOM, createMarkerIcon } from 'config/Map.constants';

const DEFAULT_ICON = L.divIcon({
  className: styles.MarkerIcon,
  iconAnchor: [5, 5],
});

interface ClusteredMarkerLayerProps {
  items: MapDatasetItem[];
}

export function ClusteredMarkerLayer({ items }: ClusteredMarkerLayerProps) {
  const map = useMapInstance();
  const [markerClusterGroup, storeMarkerCluster] = useState<any>(
    (L as any).markerClusterGroup({
      spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: 14,
      iconCreateFunction: function(cluster: any) {
        return createMarkerIcon(
          cluster.getChildCount(),
          styles.MarkerClusterIcon
        );
      },
    })
  );

  const [createMarkerClusterGroup] = useDebouncedCallback(items => {
    // Apparently clearLayers and re-adding layers is faster https://github.com/Leaflet/Leaflet.markercluster/issues/59#issuecomment-9320628
    markerClusterGroup.clearLayers();
    if (items.length) {
      const markers: L.Marker[] = [];
      items.forEach((item: any) => {
        const marker = L.marker(L.latLng(item.latLng[0], item.latLng[1]), {
          icon: item.icon
            ? typeof item.icon === 'function'
              ? item.icon(item)
              : item.icon
            : DEFAULT_ICON,
        });
        (marker as any).type = item.type;
        markers.push(marker);
        marker.bindPopup(`<b>${item.type}</b><br/>${item.title}`);
      });

      markerClusterGroup.addLayers(markers);
      markerClusterGroup.on('click', (e: any) => {
        if (!!e.layer.type) {
          map!.setView(e.latlng, LOCATION_ZOOM);
        }
      });

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
