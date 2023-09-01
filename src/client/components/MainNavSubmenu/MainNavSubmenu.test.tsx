import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import MainNavSubmenu from './MainNavSubmenu';

const SUBMENU_TITLE = 'submenutje';

describe('<MainNavSubmenu/> rendering', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('Opens/closes the submenu panel on user interaction', () => {
    const { container, getByText } = render(
      <BrowserRouter>
        <MainNavSubmenu title={SUBMENU_TITLE} id="een-submenu">
          <a href="/">Linkje</a>
        </MainNavSubmenu>
      </BrowserRouter>
    );
    act(() => {
      userEvent.hover(screen.getByText(SUBMENU_TITLE));
      vi.runAllTimers();
    });

    expect(screen.getByText('Linkje')).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden=false]')).toBeInTheDocument();

    act(() => {
      userEvent.unhover(screen.getByText(SUBMENU_TITLE));
      vi.runAllTimers();
    });

    expect(container.querySelector('[aria-hidden=true]')).toBeInTheDocument();

    act(() => {
      getByText(SUBMENU_TITLE).parentElement?.focus();
      vi.runAllTimers();
    });

    expect(container.querySelector('[aria-hidden=false]')).toBeInTheDocument();

    act(() => {
      getByText(SUBMENU_TITLE).parentElement?.blur();
      vi.runAllTimers();
    });

    expect(container.querySelector('[aria-hidden=true]')).toBeInTheDocument();
  });
});
