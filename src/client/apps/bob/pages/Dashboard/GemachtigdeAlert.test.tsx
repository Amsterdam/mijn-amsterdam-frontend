import { render, screen } from '@testing-library/react';

import { GemachtigdeAlert } from './GemachtigdeAlert.tsx';

vi.mock('../../../../hooks/useAppStateStore.ts', () => ({
  useAppStateGetter: () => ({
    BRP: {
      content: {
        persoon: {
          aanschrijfwijze: 'J. Jansen',
          geboortedatum: '1 januari 1980',
        },
      },
    },
  }),
}));

describe('<GemachtigdeAlert />', () => {
  it('displays the represented person and login instructions', () => {
    render(<GemachtigdeAlert />);

    expect(
      screen.getByRole('heading', { name: 'Ingelogd als gemachtigde', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText('J. Jansen (1 januari 1980)')).toBeInTheDocument();
    expect(
      screen.getByText(
        /U ziet alleen de gegevens waarvoor u een machtiging heeft gekregen/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Wilt u uw eigen gegevens zien\? Log dan uit/)
    ).toHaveTextContent('‘Inloggen met DigiD’');
  });
});
