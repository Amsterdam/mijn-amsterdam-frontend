import { ComponentType } from 'react';

import { MemoryRouter, Route } from 'react-router-dom';
import { MutableSnapshot, RecoilRoot } from 'recoil';

interface MockAppProps {
  routePath: string;
  routeEntry: string;
  initializeState?: (mutableSnapshot: MutableSnapshot) => void;
  component: ComponentType;
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
