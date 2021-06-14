import { MutableSnapshot, RecoilRoot } from 'recoil';
import { Component } from 'react';

import { MemoryRouter, Route } from 'react-router-dom';

interface MockAppProps {
  routePath: string;
  routeEntry: string;
  initializeState?: (mutableSnapshot: MutableSnapshot) => void;
  component: Component | any;
}

export default function MockApp({
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
