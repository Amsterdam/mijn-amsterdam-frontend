import { useCallback, useEffect } from 'react';

import { useLocation } from 'react-router-dom';

import { useKeyUp } from '../../hooks/useKey';
import { useSearchActive } from '../Search/useSearch';

export function getMenuButtonNode() {
  const button = document.querySelector(
    'button[aria-controls=ams-mega-menu].ams-header__mega-menu-button'
  );
  return button as HTMLButtonElement;
}

export function useCloseMenu() {
  const closeMenu = useCallback(() => {
    getMenuButtonNode()?.click();
  }, []);

  const location = useLocation();
  const [isSearchActive] = useSearchActive();

  useEffect(() => {
    if (isSearchActive) {
      closeMenu();
    }
  }, [isSearchActive, closeMenu]);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  const keyHandler = useCallback(
    (event: KeyboardEvent) => {
      const isEscape = event.key === 'Escape';
      if (isEscape) {
        closeMenu();
      }
    },
    [closeMenu]
  );

  useKeyUp(keyHandler);

  return closeMenu;
}
