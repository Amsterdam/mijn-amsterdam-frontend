import { useRef, useEffect, useCallback, useState } from 'react';

import { create } from 'zustand';

import { useKeyUp } from '../../hooks/useKey';
import { MAIN_MENU_ID } from '../MainMenu/MainMenu';
import { useDisplayLiveSearch, useSearchStore } from '../Search/useSearch';

type MainMenuStore = {
  isMainMenuOpen: boolean;
  open: () => void;
  close: () => void;
  toggleMainMenu: () => void;
};

export const useMainMenuOpen = create<MainMenuStore>((set) => ({
  isMainMenuOpen: false,
  open: () => set({ isMainMenuOpen: true }),
  close: () => set({ isMainMenuOpen: false }),
  toggleMainMenu: () =>
    set((state) => ({ isMainMenuOpen: !state.isMainMenuOpen })),
}));

function getMainMenuControlButtonNode(parent: HTMLDivElement | null) {
  return parent?.querySelector(
    '[aria-controls="ams-page-header-mega-menu"]'
  ) as HTMLButtonElement;
}

export function useMainHeaderControl() {
  const { isSearchActive, setSearchActive } = useSearchStore();
  const { isMainMenuOpen, toggleMainMenu } = useMainMenuOpen();

  const [headerHeight, setHeaderHeight] = useState(0);
  const isDisplayLiveSearch = useDisplayLiveSearch();

  const ref = useRef<HTMLDivElement | null>(null);

  // Bind the main menu button to set open/closed state
  useEffect(() => {
    function clickMainMenuButton() {
      if (isSearchActive && !isMainMenuOpen) {
        setSearchActive(false);
      }
      toggleMainMenu();
    }

    const el = getMainMenuControlButtonNode(ref.current);

    el?.addEventListener('click', clickMainMenuButton);

    if (isSearchActive && isMainMenuOpen) {
      // Closes the main menu when the search is active and the main menu is open.
      el?.click();
    }

    return () => {
      el?.removeEventListener('click', clickMainMenuButton);
    };
  }, [ref.current, isMainMenuOpen, isSearchActive]);

  const closeMenuAndSearch = useCallback(() => {
    if (isMainMenuOpen) {
      getMainMenuControlButtonNode(ref.current)?.click();
    }
    if (isSearchActive) {
      setSearchActive(false);
    }
  }, [ref.current, isMainMenuOpen, isSearchActive]);

  const closeByEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      const isEscape = event.key === 'Escape';
      if (isEscape) {
        closeMenuAndSearch();
      }
    },
    [closeMenuAndSearch]
  );

  useKeyUp(closeByEscapeKey);

  // Close the main menu or search when the route changes
  useEffect(() => {
    closeMenuAndSearch();
  }, [location.pathname]);

  // Close the main menu when a link in the main menu is clicked
  useEffect(() => {
    const mainMenu = document?.getElementById(MAIN_MENU_ID);

    if (isMainMenuOpen) {
      mainMenu?.addEventListener('click', closeMenuAndSearch);
    }

    return () => {
      mainMenu?.removeEventListener('click', closeMenuAndSearch);
    };
  }, [isMainMenuOpen, closeMenuAndSearch]);

  // Open the search when the 'z' key is pressed
  useKeyUp((event) => {
    if (
      event.key === 'z' &&
      !isSearchActive &&
      isDisplayLiveSearch &&
      !(event.target instanceof HTMLInputElement) &&
      !(event.target instanceof HTMLTextAreaElement)
    ) {
      setSearchActive(true);
    }
  });

  // Set the header height when the main menu is open, use the timeout to ensure the height is correct (height will be determined at the end of the current event loop).
  useEffect(() => {
    if (isMainMenuOpen) {
      setTimeout(() => {
        const headerHeight = ref.current?.getBoundingClientRect().height;
        setHeaderHeight(headerHeight || 0);
      }, 0);
    }
  }, [isMainMenuOpen]);

  return {
    ref,
    isMainMenuOpen,
    isSearchActive,
    headerHeight,
    closeMenuAndSearch,
  };
}
