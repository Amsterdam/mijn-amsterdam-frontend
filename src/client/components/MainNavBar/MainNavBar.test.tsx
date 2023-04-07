import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks';
import { useTabletScreen } from '../../hooks/media.hook';
import {
  useProfileType,
  useProfileTypeValue,
} from '../../hooks/useProfileType';
import MockApp from '../../pages/MockApp';
import MainNavBar from './MainNavBar';

jest.mock('../../hooks/media.hook');
jest.mock('../../hooks/useProfileType', () => {
  return {
    __esModule: true,
    ...(jest.requireActual('../../hooks/useProfileType') as object),
    useProfileType: jest.fn(),
    useProfileTypeValue: jest.fn(),
  };
});

const testState: any = {
  BRP: {
    status: 'OK',
    content: { persoon: { opgemaakteNaam: 'Test van FooBar', mokum: true } },
  },
  PROFILE: {
    status: 'OK',
    content: {
      profile: { id: 'test@test.com' },
    },
  },
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
    (useProfileType as jest.Mock).mockReturnValue(['private', jest.fn()]);
    (useProfileTypeValue as jest.Mock).mockReturnValue('private');

    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();

    expect(screen.getByText(/Vergunningen/)).toBeInTheDocument();
  });

  it('Renders burger menu on small screens', () => {
    (useProfileType as jest.Mock).mockReturnValue(['private', jest.fn()]);
    (useProfileTypeValue as jest.Mock).mockReturnValue('private');

    (useTabletScreen as jest.Mock).mockReturnValueOnce(true);

    render(<Component />);

    expect(screen.getByText(/Vergunningen/)).toBeInTheDocument();
    expect(screen.getAllByText('Toon navigatie')[0]).toBeInTheDocument();
    userEvent.click(screen.getAllByText('Toon navigatie')[0]);
    expect(screen.getAllByText('Verberg navigatie')[0]).toBeInTheDocument();
    expect(screen.getByText('Uitloggen')).toBeInTheDocument();
  });

  it('Shows/Hides  Search based on profile type', () => {
    (useProfileType as jest.Mock).mockReturnValue(['private', jest.fn()]);
    (useProfileTypeValue as jest.Mock).mockReturnValue('private');

    const view = render(<Component />);
    expect(screen.getByText(/Test\svan\sFooBar/)).toBeInTheDocument();
    expect(
      screen.getByLabelText('Zoeken in mijn amsterdam')
    ).toBeInTheDocument();

    (useProfileType as jest.Mock).mockReturnValue([
      'private-attributes',
      jest.fn(),
    ]);
    (useProfileTypeValue as jest.Mock).mockReturnValue('private-attributes');

    view.rerender(<Component />);

    expect(screen.getByText(/test@test\.com/)).toBeInTheDocument();

    expect(
      screen.queryByLabelText('Zoeken in mijn amsterdam')
    ).not.toBeInTheDocument();
  });
});
