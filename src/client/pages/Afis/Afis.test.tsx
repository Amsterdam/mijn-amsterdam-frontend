import { render, screen } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Afis from './Afis';

const testState: any = {
  AFIS: {
    status: 'OK',
    content: {
      id: '1',
      name: 'Afis',
      description: 'Afis',
      url: 'https://afis.nl',
      businessPartnerIdEncrypted: '1',
    },
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Afis />', () => {
  const routeEntry = generatePath(AppRoutes.AFIS);
  const routePath = AppRoutes.AFIS;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Afis}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
