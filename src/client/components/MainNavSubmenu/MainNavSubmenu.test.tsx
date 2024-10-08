import { act, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import MainNavSubmenu from './MainNavSubmenu';

const SUBMENU_TITLE = 'submenutje';

describe('<MainNavSubmenu/> rendering', () => {
  vi.useFakeTimers();

  it('Opens/closes the submenu panel on user interaction', async () => {
    const user = userEvent.setup();

    const screen = render(
      <BrowserRouter>
        <MainNavSubmenu title={SUBMENU_TITLE} id="een-submenu">
          <a href="/">Linkje</a>
        </MainNavSubmenu>
      </BrowserRouter>
    );

    const submenu = screen.container.querySelector(
      '[data-submenu-id=een-submenu]'
    )!;

    fireEvent.mouseEnter(submenu);

    act(() => {
      vi.advanceTimersToNextTimer();
    });

    expect(screen.getByText('Linkje')).toBeInTheDocument();

    expect(
      screen.container.querySelector('[aria-hidden=false]')
    ).toBeInTheDocument();

    fireEvent.mouseLeave(submenu);

    act(() => {
      vi.runAllTimers();
    });

    expect(
      screen.container.querySelector('[aria-hidden=true]')
    ).toBeInTheDocument();

    screen.getByText(SUBMENU_TITLE).parentElement?.focus();

    act(() => {
      vi.runAllTimers();
    });

    expect(
      screen.container.querySelector('[aria-hidden=false]')
    ).toBeInTheDocument();

    screen.getByText(SUBMENU_TITLE).parentElement?.blur();

    act(() => {
      vi.runAllTimers();
    });

    expect(
      screen.container.querySelector('[aria-hidden=true]')
    ).toBeInTheDocument();
  });
});
