import classnames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppRoutes,
  ThemaTitles,
  OTAP_ENV,
  myThemasMenuItems,
} from '../../../universal/config';
import { getApiErrors } from '../../config/api';
import { useAppStateGetter } from '../../hooks';
import { ErrorMessages } from '../../components';
import MainHeaderHero from '../MainHeaderHero/MainHeaderHero';
import styles from './MainHeader.module.scss';
import { PageMenu, Header } from '@amsterdam/design-system-react';
import { animated, useSpring } from '@react-spring/web';
import { Search } from '../Search/Search';
import MegaMenu from '../MegaMenu/MegaMenu';
import { useProfileTypeValue, useTermReplacement } from '../../hooks';
import { useThemas } from '../../hooks/useThemas';
import { useSearchOnPage } from '../Search/useSearch';
import { SearchEntry } from '../Search/searchConfig';
import { isMenuItemVisible, mainMenuItems } from './MainHeader.constants';
import { isError } from '../../../universal/helpers';
import { ProfileName } from './ProfileName';
import { MaLink } from '../MaLink/MaLink';
import { useSessionValue } from '../../hooks/api/useSessionApi';

export interface MainHeaderProps {
  isAuthenticated?: boolean;
  isHeroVisible?: boolean;
}

function OtapLabel() {
  return ['test', 'development', 'acceptance'].includes(OTAP_ENV) ? (
    <small
      className={classnames(
        styles['otap-env'],
        styles[`otap-env--${OTAP_ENV}`]
      )}
    >
      {OTAP_ENV}
    </small>
  ) : null;
}

const AmsMegaMenuClassname = 'ams-mega-menu';
const BurgerMenuToggleBtnId = 'BurgerMenuToggleBtn';

function isTargetWithinMenu(target: any) {
  const LinkContainer = document.querySelector(`.${AmsMegaMenuClassname}`);
  const BurgerMenuToggleButton = document.getElementById(BurgerMenuToggleBtnId);
  return (
    LinkContainer?.contains(target) || BurgerMenuToggleButton?.contains(target)
  );
}

export function SecondaryLinks() {
  const { BRP, KVK, PROFILE } = useAppStateGetter();
  const session = useSessionValue();

  const profileType = useProfileTypeValue();

  return (
    <>
      <MaLink
        maVariant="noDefaultUnderline"
        href={''}
        onClick={(event) => {
          event.preventDefault();
          session.logout();
          return false;
        }}
      >
        Uitloggen
      </MaLink>
      {!isError(BRP) && !isError(KVK) && (
        <ProfileName
          person={BRP.content?.persoon}
          company={KVK.content}
          profileType={profileType}
          profileAttribute={PROFILE.content?.profile.id}
        />
      )}
    </>
  );
}

export default function MainHeader({
  isAuthenticated = false,
  isHeroVisible = true,
}: MainHeaderProps) {
  const appState = useAppStateGetter();
  const errors = useMemo(() => getApiErrors(appState), [appState]);
  const hasErrors = !!errors.length;
  const termReplace = useTermReplacement();
  const [isBurgerMenuVisible, toggleBurgerMenu] = useState<boolean | undefined>(
    undefined
  );
  const { items: myThemasMenuItems } = useThemas();
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

  // Bind click outside and tab navigation interaction
  useEffect(() => {
    const onTab = (event: KeyboardEvent) => {
      const isMenuTarget = isTargetWithinMenu(event.target);
      if (event.key === 'Tab') {
        if (isBurgerMenuVisible === true && !isMenuTarget) {
          toggleBurgerMenu(false);
        } else if (isBurgerMenuVisible === false && isMenuTarget) {
          toggleBurgerMenu(true);
        }
      }
    };

    const onClickOutsideBurgermenu = (event?: MouseEvent) => {
      if (isBurgerMenuVisible === true && !isTargetWithinMenu(event?.target)) {
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

  const replaceResultUrl = useCallback((result: SearchEntry) => {
    return result.url.startsWith(AppRoutes.BUURT);
  }, []);

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
      let menuHeight = menuRef.current?.offsetHeight + 10;
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

  useEffect(() => {
    const h1Element = document.querySelector('h1');
    const goToHomepage = () => {
      window.location.href = '/';
    };
    if (h1Element?.textContent === 'Mijn Amsterdam') {
      h1Element.addEventListener('click', goToHomepage);
    }
    return () => {
      h1Element?.removeEventListener('click', goToHomepage);
    };
  }, []);

  return (
    <>
      <div className={styles.headerContainer}>
        <Header
          ref={menuRef}
          className={styles.header}
          title="Mijn Amsterdam"
          links={
            isAuthenticated && (
              <PageMenu alignEnd>
                <SecondaryLinks />
                {isDisplayLiveSearch && (
                  <MaLink
                    maVariant="noDefaultUnderline"
                    href={AppRoutes.SEARCH}
                    onClick={(event) => {
                      event.preventDefault();
                      setSearchActive(!isSearchActive);
                    }}
                    className={styles.menuLinkSearch}
                  >
                    Zoeken
                  </MaLink>
                )}
              </PageMenu>
            )
          }
          menu={
            isAuthenticated && (
              <>
                {!isBurgerMenuVisible ? (
                  <button
                    aria-label="Open menu"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBurgerMenu(true);
                    }}
                    className="ams-header__menu-button"
                  >
                    Menu
                  </button>
                ) : (
                  isBurgerMenuVisible && (
                    <button
                      aria-label="Sluit menu"
                      onClick={() => toggleBurgerMenu(false)}
                      className={styles.menuLinkClose}
                    >
                      Menu
                    </button>
                  )
                )}
              </>
            )
          }
        />
        <OtapLabel />
        {isDisplayLiveSearch && isSearchActive && (
          <div className={styles.Search}>
            <div className={styles.SearchBar}>
              <div className={styles.SearchBarInner}>
                <Search
                  onFinish={() => {
                    setSearchActive(false);
                  }}
                  replaceResultUrl={replaceResultUrl}
                />
              </div>
            </div>
          </div>
        )}

        {isBurgerMenuVisible && (
          <MegaMenu themas={myThemasMenuItems} menuItems={menuItems} />
        )}

        {isAuthenticated && hasErrors && (
          <ErrorMessages errors={errors} className={styles.ErrorMessages} />
        )}
      </div>
      {isHeroVisible && <MainHeaderHero />}

      <animated.div
        ref={backdropRef}
        key="BurgerMenuBackDrop"
        className={styles.Backdrop}
        style={fadeStyles}
      />
    </>
  );
}
