import { render } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { appStateAtom } from '../../hooks/useAppState.ts';
import MockApp from '../MockApp.tsx';
import { GeneralInfo } from './GeneralInfo.tsx';
import { GeneralInfoRoute } from './GeneralInfo-routes.ts';
import type { AppState } from '../../../universal/types/App.types.ts';

const testState = {
  CMS_CONTENT: {
    status: 'OK',
    content: {
      content: '<p>Dingen! <a href="http://example.org">Linkje</a></p>',
      title: 'Algemene info',
    },
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState as AppState);
}

describe('<GeneralInfo />', () => {
  const routeEntry = generatePath(GeneralInfoRoute.route);
  const routePath = GeneralInfoRoute.route;

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={GeneralInfo}
        initializeState={initializeState}
      />
    );
  }

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
