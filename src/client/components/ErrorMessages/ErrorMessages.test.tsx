import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MutableSnapshot } from 'recoil';
import { describe, it, expect } from 'vitest';

import { ErrorMessages } from './ErrorMessages';
import { AppState } from '../../../universal/types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../../pages/MockApp';

function initializeState(testState: AppState) {
  return (snapshot: MutableSnapshot) => snapshot.set(appStateAtom, testState);
}

describe('<ErrorMessages />', () => {
  function Component() {
    return (
      <MockApp
        routeEntry="/"
        routePath="/"
        component={ErrorMessages}
        initializeState={initializeState({
          BRP: {
            status: 'ERROR',
            content: null,
          },
        } as AppState)}
      />
    );
  }

  it('Renders without crashing', () => {
    render(<Component />);
    expect(
      screen.getByText(/U ziet misschien niet al uw gegevens/)
    ).toBeInTheDocument();
  });

  it('Opens a modal with more detailed error info', async () => {
    const user = userEvent.setup();

    render(<Component />);
    await user.click(screen.getByText('Meer informatie'));
    expect(
      screen.getByText(/Persoonlijke gegevens, paspoort, ID-kaart/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Communicatie met api mislukt./)
    ).toBeInTheDocument();
  });
});
