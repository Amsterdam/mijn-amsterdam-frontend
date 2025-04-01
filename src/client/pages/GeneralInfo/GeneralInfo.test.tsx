import { render } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import GeneralInfo from './GeneralInfo';

const testState: any = {
  CMS_CONTENT: {
    status: 'OK',
    content: {
      generalInfo: {
        content: '<p>Dingen! <a href="http://example.org">Linkje</a></p>',
        title: 'Algemene info',
      },
    },
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<GeneralInfo />', () => {
  const routeEntry = generatePath(AppRoutes.GENERAL_INFO);
  const routePath = AppRoutes.GENERAL_INFO;

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
