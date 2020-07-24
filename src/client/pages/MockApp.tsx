import { RecoilRoot, RecoilRootProps } from 'recoil';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';

interface MockAppProps {
  routePath: string;
  routeEntry: string;
  initializeState?: RecoilRootProps['initializeState'];
  component: React.Component | any;
}

export default function MockAppAtRoute({
  routePath,
  routeEntry,
  initializeState,
  component,
}: MockAppProps) {
  return (
    <RecoilRoot initializeState={initializeState}>
      <MemoryRouter initialEntries={[routeEntry]}>
        <Route path={routePath} component={component} />
      </MemoryRouter>
    </RecoilRoot>
  );
}
