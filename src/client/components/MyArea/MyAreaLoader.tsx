import { lazy, Suspense } from 'react';
import { MyAreaProps } from './MyArea';
import styles from './MyAreaLoadingIndicator.module.scss';

export const MyAreaLazy = lazy(() => import('./MyArea'));
export const MyAreaDashboardLazy = lazy(() => import('./MyAreaDashboardMap'));

interface MyAreaLoaderProps extends MyAreaProps {
  isDashboard?: boolean;
  tutorial?: string;
}

export default function MyAreaLoader({
  isDashboard = false,
  tutorial = '',
  datasetIds,
  showPanels = true,
  showHeader = true,
  centerMarker,
  zoom,
  height = '100vh',
  activeBaseLayerType,
}: MyAreaLoaderProps) {
  return (
    <Suspense
      fallback={
        <div className={styles.MyAreaLoader} style={{ height }}>
          Loading buurt bundle...
        </div>
      }
    >
      {isDashboard ? (
        <MyAreaDashboardLazy tutorial={tutorial} />
      ) : (
        <MyAreaLazy
          datasetIds={datasetIds}
          showPanels={showPanels}
          showHeader={showHeader}
          centerMarker={centerMarker}
          activeBaseLayerType={activeBaseLayerType}
          zoom={zoom}
          height={height}
        />
      )}
    </Suspense>
  );
}
