import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks';
import { useTabletScreen } from '../../hooks/media.hook';
import MockApp from '../../pages/MockApp';
import MainNavBar from './MainNavBar';

jest.mock('../../hooks/media.hook');

const testState: any = {
  BRP: {
    status: 'OK',
    content: { persoon: { opgemaakteNaam: 'Test van FooBar' } },
  },
  PROFILE: { status: 'OK', content: {} },
  VERGUNNINGEN: { status: 'OK', content: [{ id: 'test' }] },
};

describe('<MainNavBar />', () => {
  const routeEntry = AppRoutes.HOME;
  const routePath = AppRoutes.HOME;

  function initializeState(snapshot: MutableSnapshot) {
    snapshot.set(appStateAtom, testState);
  }

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={() => <MainNavBar isAuthenticated={true} />}
      initializeState={initializeState}
    />
  );

  it('Renders without crashing', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();

    expect(screen.getByText(/Vergunningen/)).toBeInTheDocument();
  });

  it('Renders burger menu on small screens', () => {
    (useTabletScreen as jest.Mock).mockReturnValue(true);

    render(<Component />);

    expect(screen.getByText(/Vergunningen/)).toBeInTheDocument();
    expect(screen.getAllByText('Toon navigatie')[0]).toBeInTheDocument();
    userEvent.click(screen.getAllByText('Toon navigatie')[0]);
    expect(screen.getAllByText('Verberg navigatie')[0]).toBeInTheDocument();
    expect(screen.getByText('Uitloggen')).toBeInTheDocument();
  });
});
