import React, { Suspense } from 'react';

export const MyArea2Lazy = React.lazy(() => import('./MyArea2'));
export const MyArea2DashboardLazy = React.lazy(
  () => import('./MyArea2Dashboard')
);

interface MyArea2LoaderProps {
  isDashboard: boolean;
}

export function MyArea2Loader({ isDashboard }: MyArea2LoaderProps) {
  return (
    <Suspense fallback={<div>Loading buurt bundle...</div>}>
      {isDashboard ? <MyArea2DashboardLazy /> : <MyArea2Lazy />}
    </Suspense>
  );
}
