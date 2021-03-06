import { render, screen } from '@testing-library/react';
import ErrorMessages from './ErrorMessages';
import { RecoilRoot } from 'recoil';
import userEvent from '@testing-library/user-event';

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

  (window as any).scrollTo = jest.fn();

  it('Renders without crashing', () => {
    render(<Component />);
    expect(
      screen.getByText(/U ziet misschien niet al uw gegevens/)
    ).toBeInTheDocument();
  });

  it('Opens a modal with more detailed error info', () => {
    render(<Component />);
    userEvent.click(screen.getByText('Meer informatie'));
    expect(screen.getByText(/Een api naam/)).toBeInTheDocument();
    expect(screen.getByText(/De server reageert niet/)).toBeInTheDocument();
  });
});
