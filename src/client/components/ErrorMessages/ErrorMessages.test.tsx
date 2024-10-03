import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecoilRoot } from 'recoil';
import { describe, it, expect } from 'vitest';

import ErrorMessages from './ErrorMessages';

const DUMMY_ERRORS = [
  {
    name: 'Een api naam',
    error: 'De server reageert niet',
    stateKey: 'API_NAAM',
  },
];

describe('<ErrorMessages />', () => {
  const Component = () => (
    <RecoilRoot>
      <ErrorMessages errors={DUMMY_ERRORS} />
    </RecoilRoot>
  );

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
    expect(screen.getByText(/Een api naam/)).toBeInTheDocument();
    expect(screen.getByText(/De server reageert niet/)).toBeInTheDocument();
  });
});
