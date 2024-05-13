import classnames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppRoutes, ChapterTitles, OTAP_ENV } from '../../../universal/config';
import { getApiErrors, LOGOUT_URL } from '../../config/api';
import { useAppStateGetter } from '../../hooks';
import { ErrorMessages } from '../../components';
import MainHeaderHero from '../MainHeaderHero/MainHeaderHero';
import styles from './MainHeader.module.scss';
import { PageMenu, Header } from '@amsterdam/design-system-react';
import { animated } from '@react-spring/web';
import { Search } from '../Search/Search';
import MegaMenu from '../MegaMenu/MegaMenu';
import { useProfileTypeValue, useTermReplacement } from '../../hooks';
import { useChapters } from '../../hooks/useChapters';
import { useSearchOnPage } from '../Search/useSearch';
import { SearchEntry } from '../Search/searchConfig';
import { isUiElementVisible } from '../../config/app';
import { isMenuItemVisible, mainMenuItems } from './MainHeader.constants';
import { isError } from '../../../universal/helpers';
import { ProfileName } from './ProfileName';

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

  const profileType = useProfileTypeValue();

  return (
    <>
      <PageMenu.Link href={LOGOUT_URL}>Uitloggen</PageMenu.Link>
      {!isError(BRP) ||
        (!isError(KVK) && (
          <ProfileName
            person={BRP.content?.persoon}
            company={KVK?.content}
            profileType={profileType}
            profileAttribute={PROFILE.content?.profile?.id}
          />
        ))}
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
  const { items: myChapterItems } = useChapters();
  const location = useLocation();
  const profileType = useProfileTypeValue();
  const { isSearchActive, setSearchActive, isDisplayLiveSearch } =
    useSearchOnPage();

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

  // Hides small screen menu on route change
  useEffect(() => {
    toggleBurgerMenu(false);
  }, [location.pathname]);

  const replaceResultUrl = useCallback((result: SearchEntry) => {
    return result.url.startsWith(AppRoutes.BUURT);
  }, []);

  const isSimpleNavBarEnabled = isUiElementVisible(
    profileType,
    'MainNavBarSimple'
  );

  const menuItems = useMemo(() => {
    if (isSimpleNavBarEnabled) {
      return [];
    }
    return mainMenuItems
      .filter((menuItem) => isMenuItemVisible(profileType, menuItem))
      .map((item) => {
        let menuItem = item;
        if (
          menuItem.title === ChapterTitles.BUURT &&
          profileType !== 'private'
        ) {
          menuItem = {
            ...menuItem,
            title: termReplace(menuItem.title),
          };
        }

        return menuItem;
      });
  }, [myChapterItems, profileType, termReplace, isSimpleNavBarEnabled]);

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

  return (
    <>
      <div className={styles.headerContainer}>
        <Header
          ref={menuRef}
          className={styles.header}
          title="Mijn Amsterdam"
          links={
            isAuthenticated && (
              <>
                <PageMenu alignEnd>
                  <SecondaryLinks />
                  <PageMenu.Link href="#">
                    <button
                      aria-label={'Search'}
                      onClick={() => setSearchActive(!isSearchActive)}
                      className={styles.menuLinkSearch}
                    >
                      Zoeken
                    </button>
                  </PageMenu.Link>
                </PageMenu>
              </>
            )
          }
          menu={
            isAuthenticated && (
              <>
                {!isBurgerMenuVisible ? (
                  <button
                    aria-label={'Open menu'}
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
                      aria-label={'Close menu'}
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

        {!isSimpleNavBarEnabled && isDisplayLiveSearch && isSearchActive && (
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
          <MegaMenu chapters={myChapterItems} menuItems={menuItems} />
        )}
      </div>
      {isAuthenticated && hasErrors && (
        <ErrorMessages errors={errors} className={styles.ErrorMessages} />
      )}
      {isHeroVisible && <MainHeaderHero />}

      {isBurgerMenuVisible && (
        <animated.div
          ref={backdropRef}
          key="BurgerMenuBackDrop"
          className={styles.Backdrop}
        />
      )}
    </>
  );
}
