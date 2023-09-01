import { render } from '@testing-library/react';

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

import { Mock, describe, expect, it, vi } from 'vitest';

vi.mock('../../hooks/media.hook');
vi.mock('../../hooks/useProfileType', async (requireActual) => {
  return {
    ...((await requireActual()) as object),
    useProfileType: vi.fn(),
    useProfileTypeValue: vi.fn(),
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
    (useProfileType as Mock).mockReturnValue(['private', vi.fn()]);
    (useProfileTypeValue as Mock).mockReturnValue('private');

    const screen = render(<Component />);
    const { asFragment } = screen;
    expect(asFragment()).toMatchSnapshot();

    expect(screen.getAllByText(/Vergunningen/)[0]).toBeInTheDocument();
  });

  it('Renders burger menu on small screens', () => {
    (useProfileType as Mock).mockReturnValue(['private', vi.fn()]);
    (useProfileTypeValue as Mock).mockReturnValue('private');
    (useTabletScreen as Mock).mockReturnValue(true);

    const screen = render(<Component />);

    expect(screen.getAllByText(/Vergunningen/)[0]).toBeInTheDocument();
    expect(screen.getAllByText('Toon navigatie')[0]).toBeInTheDocument();
    userEvent.click(screen.getAllByText('Toon navigatie')[0]);
    expect(screen.getAllByText('Verberg navigatie')[0]).toBeInTheDocument();
    expect(screen.getByText('Uitloggen')).toBeInTheDocument();
  });

  it('Shows different ID based on profile type', () => {
    (useProfileType as Mock).mockReturnValue(['private', vi.fn()]);
    (useProfileTypeValue as Mock).mockReturnValue('private');

    const view = render(<Component />);
    expect(view.getByText(/Test\svan\sFooBar/)).toBeInTheDocument();

    (useProfileType as Mock).mockReturnValue(['private-attributes', vi.fn()]);
    (useProfileTypeValue as Mock).mockReturnValue('private-attributes');

    view.rerender(<Component />);

    expect(view.getByText(/test@test\.com/)).toBeInTheDocument();
  });
});
