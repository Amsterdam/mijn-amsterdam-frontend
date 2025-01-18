import { useMemo, useState, useEffect, useRef } from 'react';

import { useSpring } from '@react-spring/web';
import { useLocation } from 'react-router-dom';

import { mainMenuItems, isMenuItemVisible } from './MainHeader.constants';
import { getApiErrors } from '../../config/api';
import { ThemaTitles } from '../../config/thema';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import { useThemaMenuItems } from '../../hooks/useThemaMenuItems';
import {
  AmsMainMenuClassname,
  BurgerMenuToggleBtnId,
} from '../MainMenu/MainMenu';
import { useSearchOnPage } from '../Search/useSearch';

function isTargetWithinMenu(target: Node | null) {
  const LinkContainer = document.querySelector(`.${AmsMainMenuClassname}`);
  const BurgerMenuToggleButton = document.getElementById(BurgerMenuToggleBtnId);
  return (
    LinkContainer?.contains(target) || BurgerMenuToggleButton?.contains(target)
  );
}

export function useMainHeaderData() {
  const appState = useAppStateGetter();
  const errors = useMemo(() => getApiErrors(appState), [appState]);
  const hasErrors = !!errors.length;
  const termReplace = useTermReplacement();
  const [isBurgerMenuVisible, toggleBurgerMenu] = useState<boolean | undefined>(
    undefined
  );
  const { items: myThemasMenuItems } = useThemaMenuItems();
  const location = useLocation();
  const profileType = useProfileTypeValue();
  const { isSearchActive, setSearchActive, isDisplayLiveSearch } =
    useSearchOnPage();

  const fadeStyles = useSpring({
    config: { duration: 100 },
    from: { opacity: 0, display: 'none' },
    to: {
      opacity: isBurgerMenuVisible ? 1 : 0,
      display: isBurgerMenuVisible ? 'block' : 'none',
    },
  });

  const isPhoneScreen = usePhoneScreen();

  // Bind click outside and tab navigation interaction
  useEffect(() => {
    const onTab = (event: KeyboardEvent) => {
      const isMenuTarget = isTargetWithinMenu(event.target as Node);
      if (event.key === 'Tab') {
        if (isBurgerMenuVisible === true && !isMenuTarget) {
          toggleBurgerMenu(false);
        } else if (isBurgerMenuVisible === false && isMenuTarget) {
          toggleBurgerMenu(true);
        }
      }
    };

    const onClickOutsideBurgermenu = (event?: MouseEvent) => {
      if (
        isBurgerMenuVisible === true &&
        !isTargetWithinMenu(event?.target as Node)
      ) {
        toggleBurgerMenu(false);
      }
    };

    document.addEventListener('keyup', onTab);
    document.addEventListener('click', onClickOutsideBurgermenu);
    return () => {
      document.removeEventListener('keyup', onTab);
      document.removeEventListener('click', onClickOutsideBurgermenu);
    };
  }, [isBurgerMenuVisible]);

  // Close menu on click escape key
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        toggleBurgerMenu(false);
        activeElement?.blur();
        return;
      }
    };
    if (!isBurgerMenuVisible) return;

    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('keydown', onEscape);
    };
  }, [isBurgerMenuVisible]);

  // Hides small screen menu on route change
  useEffect(() => {
    toggleBurgerMenu(false);
  }, [location.pathname]);

  // Hides search on menu open
  useEffect(() => {
    if (isBurgerMenuVisible) {
      setSearchActive(false);
    }
  }, [setSearchActive, isBurgerMenuVisible]);

  // Hides menu on search open
  useEffect(() => {
    if (isSearchActive) {
      toggleBurgerMenu(false);
    }
  }, [toggleBurgerMenu, isSearchActive]);

  const menuItems = useMemo(() => {
    return mainMenuItems
      .filter((menuItem) => isMenuItemVisible(profileType, menuItem))
      .map((item) => {
        let menuItem = item;
        if (menuItem.title === ThemaTitles.BUURT && profileType !== 'private') {
          menuItem = {
            ...menuItem,
            title: termReplace(menuItem.title),
          };
        }

        return menuItem;
      });
  }, [myThemasMenuItems, profileType, termReplace]);

  const backdropRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adjustOverlay = () => {
      if (!menuRef.current) {
        return;
      }

      // Add 10 pixels to the height to make sure the overlay is not visible when the menu is changing is size
      const PADDING_HEIGHT = 10;
      let menuHeight = menuRef.current?.offsetHeight + PADDING_HEIGHT;
      const scrollTop = window.scrollY;

      if (scrollTop >= menuHeight) {
        menuHeight = 0;
      }
      if (backdropRef.current && isBurgerMenuVisible) {
        backdropRef.current.style.top = `${menuHeight}px`;
        backdropRef.current.style.height = `calc(100vh - ${menuHeight}px)`;
      }
    };

    adjustOverlay();
    window.addEventListener('resize', adjustOverlay);
    window.addEventListener('scroll', adjustOverlay);
    window.addEventListener('touchmove', adjustOverlay);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('resize', adjustOverlay);
      window.removeEventListener('scroll', adjustOverlay);
      window.removeEventListener('touchmove', adjustOverlay);
    };
  }, [isBurgerMenuVisible]);

  return {
    errors,
    fadeStyles,
    hasErrors,
    isBurgerMenuVisible,
    isDisplayLiveSearch,
    isPhoneScreen,
    isSearchActive,
    menuItems,
    myThemasMenuItems,
    setSearchActive,
    toggleBurgerMenu,
  };
}
