import { lazy, Suspense } from 'react';

import type { MyAreaProps } from './MyArea.tsx';
import styles from './MyAreaLoadingIndicator.module.scss';

export const MyAreaLazy = lazy(() => import('./MyArea.tsx'));
export const MyAreaDashboardLazy = lazy(
  () => import('./MyAreaDashboardMap.tsx')
);

interface MyAreaLoaderProps extends MyAreaProps {
  isDashboard?: boolean;
}

export function MyAreaLoader({
  isDashboard = false,
  datasetIds,
  showPanels = true,
  centerMarker,
  zoom,
  activeBaseLayerType,
  showHomeLocationMarker,
  showSecondaryLocationMarkers,
}: MyAreaLoaderProps) {
  return (
    <Suspense
      fallback={
        <div className={styles.MyAreaLoader}>Loading buurt bundle...</div>
      }
    >
      {isDashboard ? (
        <MyAreaDashboardLazy />
      ) : (
        <MyAreaLazy
          datasetIds={datasetIds}
          showPanels={showPanels}
          centerMarker={centerMarker}
          activeBaseLayerType={activeBaseLayerType}
          zoom={zoom}
          showHomeLocationMarker={showHomeLocationMarker}
          showSecondaryLocationMarkers={showSecondaryLocationMarkers}
        />
      )}
    </Suspense>
  );
}
