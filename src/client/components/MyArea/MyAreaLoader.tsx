import React, { Suspense } from 'react';
import styles from './MyAreaLoadingIndicator.module.scss';

export const MyAreaLazy = React.lazy(() => import('./MyArea'));
export const MyAreaDashboardLazy = React.lazy(
  () => import('./MyAreaDashboardMap')
);

interface MyAreaLoaderProps {
  isDashboard?: boolean;
  tutorial?: string;
}

export default function MyAreaLoader({
  isDashboard = false,
  tutorial = '',
}: MyAreaLoaderProps) {
  return (
    <Suspense
      fallback={
        <div className={styles.MyAreaLoader} style={{ height: '100vh' }}>
          Loading buurt bundle...
        </div>
      }
    >
      {isDashboard ? (
        <MyAreaDashboardLazy tutorial={tutorial} />
      ) : (
        <MyAreaLazy />
      )}
    </Suspense>
  );
}
