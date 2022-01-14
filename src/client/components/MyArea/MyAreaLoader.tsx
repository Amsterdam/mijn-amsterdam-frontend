import { lazy, Suspense } from 'react';
import { MyAreaProps } from './MyArea';
import styles from './MyAreaLoadingIndicator.module.scss';

export const MyAreaLazy = lazy(() => import('./MyArea'));
export const MyAreaDashboardLazy = lazy(() => import('./MyAreaDashboardMap'));

interface MyAreaLoaderProps extends MyAreaProps {
  isDashboard?: boolean;
}

export default function MyAreaLoader({
  isDashboard = false,
  datasetIds,
  showPanels = true,
  showHeader = true,
  centerMarker,
  zoom,
  activeBaseLayerType,
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
          showHeader={showHeader}
          centerMarker={centerMarker}
          activeBaseLayerType={activeBaseLayerType}
          zoom={zoom}
        />
      )}
    </Suspense>
  );
}
