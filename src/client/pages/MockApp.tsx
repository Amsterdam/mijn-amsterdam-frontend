import { ComponentType, useEffect } from 'react';

import { MemoryRouter, Route, Routes } from 'react-router';

import { AppState } from '../../universal/types/App.types';
import { useAppStateStore } from '../hooks/useAppState';

interface MockAppProps {
  routePath: string;
  routeEntry: string;
  state?: Partial<AppState>;
  component: ComponentType;
}

export default function MockApp({
  routePath,
  routeEntry,
  state,
  component,
}: MockAppProps) {
  if (!component) {
    throw new Error('No component provided');
  }
  const Component = component as ComponentType;

  if (state) {
    const { setAppState, setIsAppStateReady } = useAppStateStore();

    useEffect(() => {
      setAppState(state, true);
      return () => {
        setAppState({}, false);
      };
    }, [setAppState, setIsAppStateReady, state]);
  }

  return (
    <MemoryRouter initialEntries={[routeEntry]}>
      <Routes>
        <Route path={routePath} element={<Component />} />
      </Routes>
    </MemoryRouter>
  );
}

export function componentCreator(conf: {
  component: () => JSX.Element;
  routeEntry: string;
  routePath: string;
}) {
  function createComponent(state: Partial<AppState> | Record<string, never>) {
    function Component() {
      return (
        <MockApp
          routeEntry={conf.routeEntry}
          routePath={conf.routePath}
          component={conf.component}
          state={state}
        />
      );
    }

    return Component;
  }
  return createComponent;
}
