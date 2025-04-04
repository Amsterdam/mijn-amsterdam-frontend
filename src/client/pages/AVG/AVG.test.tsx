import { render } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { AVG } from './AVG';
import { testState } from './AVGDetail.test';
import { AVGResponse } from '../../../server/services/avg/types';
import { AppState } from '../../../universal/types';

function initializeState(testState: AppState) {
  return (snapshot: MutableSnapshot) => snapshot.set(appStateAtom, testState);
}

function setupTestComponent(testState: AppState) {
  const routeEntry = generatePath(AppRoutes.AVG);
  const routePath = AppRoutes.AVG;

  return function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={AVG}
        initializeState={initializeState(testState)}
      />
    );
  };
}

describe('AVG thema pagina', () => {
  it('Matches the Full Page snapshot when there are requests', () => {
    const Component = setupTestComponent(testState);
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot when there are no requests', () => {
    const themaContent: AVGResponse = {
      verzoeken: [],
      aantal: 0,
    };
    const Component = setupTestComponent({
      AVG: {
        status: 'OK',
        content: themaContent,
      },
    } as unknown as AppState);

    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot when API gives no result', () => {
    const Component = setupTestComponent({
      AVG: {
        status: 'ERROR',
        content: null,
      },
    } as unknown as AppState);
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
