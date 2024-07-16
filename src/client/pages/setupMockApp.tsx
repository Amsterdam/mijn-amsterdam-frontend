import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes, RouteKey } from '../../universal/config/routes';
import { appStateAtom } from '../hooks/useAppState';
import MockApp from './MockApp';

export function setupMockApp(
  Component: React.FC,
  appRouteKey: RouteKey,
  testState: any
) {
  function initializeState(snapshot: MutableSnapshot) {
    snapshot.set(appStateAtom, testState);
  }

  const routePath = AppRoutes[appRouteKey];

  return (
    queryParams?:
      | {
          [x: string]: string | number | boolean | undefined;
        }
      | undefined
  ) => {
    const routeEntry = generatePath(AppRoutes[appRouteKey], queryParams);

    return render(
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Component}
        initializeState={initializeState}
      />
    );
  };
}
