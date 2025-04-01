import { ComponentType } from 'react';

import { MemoryRouter, Route } from 'react-router';
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
  return (
    <RecoilRoot initializeState={initializeState}>
      <MemoryRouter initialEntries={[routeEntry]}>
        <Route path={routePath} component={component} />
      </MemoryRouter>
    </RecoilRoot>
  );
}

export function componentCreator(conf: {
  component: () => JSX.Element;
  routeEntry: string;
  routePath: string;
}) {
  function createComponent(state: AppState) {
    function initializeState(snapshot: MutableSnapshot) {
      snapshot.set(appStateAtom, state);
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
