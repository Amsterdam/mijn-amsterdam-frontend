import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MyAreaHeader } from '..';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { usePhoneScreen, useTabletScreen } from '../../hooks/media.hook';

jest.mock('../Search/Search', () => ({ Search: () => <div>Search!</div> }));

const mockTrackSearchBarEvent = jest.fn(() => 'test!');

let mockIsSearchActive = false;
const mockSetSearchActive = jest.fn();

jest.mock('../Search/useSearch', () => {
  return {
    useSearchOnPage: () => ({
      isSearchActive: mockIsSearchActive,
      setSearchActive: mockSetSearchActive,
      trackSearchBarEvent: mockTrackSearchBarEvent,
      isDisplaySearch: false,
    }),
  };
});

const mockTermReplace = jest.fn(() => 'test!');

jest.mock('../../hooks/media.hook');
jest.mock('../../hooks/media.hook');
jest.mock('../../hooks/useProfileType');
jest.mock('../../hooks/useTermReplacement', () => ({
  termReplace: () => jest.fn,
  useTermReplacement: () => mockTermReplace,
}));

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as object),
  useLocation: () => {
    return { pathname: '/buurt' };
  },
  generatePth: (r: any) => r,
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('<MyAreaHeader/>', () => {
  it('Displays Desktop Search and Logo', () => {
    (usePhoneScreen as any).mockReturnValue(false);

    render(
      <MemoryRouter>
        <MyAreaHeader />
      </MemoryRouter>
    );

    expect(screen.getByTitle('Terug naar home')).toBeInTheDocument();
    expect(screen.getByText('Search!')).toBeInTheDocument();
    expect(mockTermReplace).toBeCalledWith(ChapterTitles.BUURT);

    const sluitenButton = screen.getByText('Kaart sluiten');
    expect(sluitenButton).toBeInTheDocument();

    userEvent.click(sluitenButton);

    expect(mockHistoryPush).toBeCalledWith(AppRoutes.ROOT);
  });

  it('Displays Phone Search and Logo', async () => {
    (usePhoneScreen as any).mockReturnValue(true);
    (useTabletScreen as any).mockReturnValue(true);

    const view = render(
      <MemoryRouter>
        <MyAreaHeader />
      </MemoryRouter>
    );

    expect(screen.getByTitle('Terug naar home')).toBeInTheDocument();
    expect(screen.queryByText('Search!')).not.toBeInTheDocument();
    expect(mockTermReplace).toBeCalledWith(ChapterTitles.BUURT);

    const kaartSluitenButton = screen.queryByText('Kaart sluiten');
    expect(kaartSluitenButton).not.toBeInTheDocument();

    const openenButton = screen.getByTitle('Zoekbalk openen');
    expect(openenButton).toBeInTheDocument();
    mockIsSearchActive = true;
    userEvent.click(openenButton);

    expect(mockSetSearchActive).toBeCalledWith(true);

    view.rerender(
      <MemoryRouter>
        <MyAreaHeader />
      </MemoryRouter>
    );

    expect(screen.getByText('Search!')).toBeInTheDocument();

    const sluitenButton = screen.getByTitle('Zoekbalk sluiten');
    expect(sluitenButton).toBeInTheDocument();
    mockIsSearchActive = false;
    userEvent.click(sluitenButton);

    expect(mockSetSearchActive).toBeCalledWith(false);

    view.rerender(
      <MemoryRouter>
        <MyAreaHeader />
      </MemoryRouter>
    );

    expect(screen.queryByText('Search!')).not.toBeInTheDocument();
  });
});
