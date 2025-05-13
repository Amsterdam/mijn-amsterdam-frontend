import { ComponentType } from 'react';

import { MemoryRouter, Route, Routes } from 'react-router';
import { MutableSnapshot, RecoilRoot } from 'recoil';

import { AppState } from '../../universal/types/App.types';
import { appStateAtom } from '../hooks/useAppState';

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
  if (!component) {
    throw new Error('No component provided');
  }
  const Component = component as ComponentType;
  return (
    <RecoilRoot initializeState={initializeState}>
      <MemoryRouter initialEntries={[routeEntry]}>
        <Routes>
          <Route path={routePath} element={<Component />} />
        </Routes>
      </MemoryRouter>
    </RecoilRoot>
  );
}

export function componentCreator(conf: {
  component: () => JSX.Element;
  routeEntry: string;
  routePath: string;
}) {
  function createComponent(state: AppState | Record<string, never>) {
    function initializeState(snapshot: MutableSnapshot) {
      snapshot.set(appStateAtom, state as AppState);
    }

    function Component() {
      return (
        <MockApp
          routeEntry={conf.routeEntry}
          routePath={conf.routePath}
          component={conf.component}
          initializeState={initializeState}
        />
      );
    }

    return Component;
  }
  return createComponent;
}
