import classnames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { animated } from '@react-spring/web';

import { AppRoutes, FeatureToggle } from '../../../universal/config';
import { ChapterTitles } from '../../../universal/config/thema';
import { isError } from '../../../universal/helpers/api';
import { ComponentChildren } from '../../../universal/types';
import { IconClose, IconSearch } from '../../assets/icons';
import AmsterdamLogo from '../../assets/images/logo-amsterdam.svg?react';
import { isUiElementVisible } from '../../config/app';
import { ThemaIcons } from '../../config/themaIcons';
import { useDesktopScreen, useTabletScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemas } from '../../hooks/useThemas';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import { IconButton } from '../Button/Button';
import FontEnlarger from '../FontEnlarger/FontEnlarger';
import MainNavSubmenu, {
  MainNavSubmenuLink,
} from '../MainNavSubmenu/MainNavSubmenu';
import { Search } from '../Search/Search';
import { SearchEntry } from '../Search/searchConfig';
import { useSearchOnPage } from '../Search/useSearch';
import LogoutLink from './LogoutLink';
import {
  MenuItem,
  isMenuItemVisible,
  mainMenuItemId,
  mainMenuItems,
} from './MainNavBar.constants';
import styles from './MainNavBar.module.scss';
import { ProfileName } from './ProfileName';
import { useBurgerMenuAnimation } from './useBurgerMenuAnimation';

const BurgerMenuToggleBtnId = 'BurgerMenuToggleBtn';
const LinkContainerId = 'MainMenu';

export interface MainNavLinkProps {
  to: string;
  children: ComponentChildren;
  title: string;
}

export function SecondaryLinks() {
  const { BRP, KVK, PROFILE } = useAppStateGetter();

  const isDesktopScreen = useDesktopScreen();
  const profileType = useProfileTypeValue();

  return (
    <div className={styles.secondaryLinks}>
      {isDesktopScreen && <FontEnlarger />}
      <span className={styles['secondaryLinks-inner']}>
        {!isError(BRP) && !isError(KVK) && (
          <ProfileName
            person={BRP.content?.persoon}
            company={KVK?.content}
            profileType={profileType}
            profileAttribute={PROFILE.content?.profile?.id}
          />
        )}
        <LogoutLink>Uitloggen</LogoutLink>
        {!isDesktopScreen && <div className={styles.HR} />}
      </span>
    </div>
  );
}

function MainNavLink({ children, to, title, ...rest }: MainNavLinkProps) {
  return (
    <NavLink exact={true} to={to} className={styles.MainNavLink} {...rest}>
      <span>{children}</span>
    </NavLink>
  );
}

function getMenuItem(item: MenuItem) {
  if (Array.isArray(item.submenuItems)) {
    return (
      <MainNavSubmenu key={item.id} title={item.title} id={item.id}>
        {item.submenuItems.map(({ id, to, title, rel }) => {
          return (
            <MainNavSubmenuLink
              key={id}
              className={styles.MainNavSubmenuLink}
              title={title}
              to={to}
              rel={rel}
              Icon={ThemaIcons[id]}
              data-thema-id={id}
            />
          );
        })}
      </MainNavSubmenu>
    );
  }

  return (
    <MainNavLink key={item.id} to={item.to} title={item.title}>
      {item.title}
    </MainNavLink>
  );
}

interface BurgerButtonProps {
  isActive: boolean;
  toggleBurgerMenu: (isActive: boolean) => void;
}

function BurgerButton({ isActive, toggleBurgerMenu }: BurgerButtonProps) {
  return (
    <button
      id={BurgerMenuToggleBtnId}
      className={classnames(
        styles.BurgerMenuToggleBtn,
        isActive && styles.BurgerMenuToggleBtnOpen
      )}
      aria-expanded={isActive}
      onClick={() => toggleBurgerMenu(!isActive)}
    >
      {isActive ? 'Verberg' : 'Toon'} navigatie
    </button>
  );
}

function isTargetWithinMenu(target: any) {
  const LinkContainer = document.getElementById(LinkContainerId);
  const BurgerMenuToggleButton = document.getElementById(BurgerMenuToggleBtnId);
  return (
    (LinkContainer && LinkContainer.contains(target)) ||
    (BurgerMenuToggleButton && BurgerMenuToggleButton.contains(target))
  );
}

export default function MainNavBar({
  isAuthenticated = false,
}: {
  isAuthenticated: boolean;
}) {
  const hasBurgerMenu = useTabletScreen();
  const termReplace = useTermReplacement();
  const [isBurgerMenuVisible, toggleBurgerMenu] = useState<boolean | undefined>(
    undefined
  );
  const { items: myChapterItems } = useThemas();
  const location = useLocation();
  const profileType = useProfileTypeValue();
  const { isSearchActive, setSearchActive, isDisplayLiveSearch } =
    useSearchOnPage();

  // Bind click outside and tab navigation interaction
  useEffect(() => {
    if (!hasBurgerMenu) {
      return;
    }
    const onTab = (event?: any) => {
      const isMenuTarget = isTargetWithinMenu(event.target);
      if (event.key === 'Tab') {
        if (isBurgerMenuVisible === true && !isMenuTarget) {
          toggleBurgerMenu(false);
        } else if (isBurgerMenuVisible === false && isMenuTarget) {
          toggleBurgerMenu(true);
        }
      }
    };

    const onClickOutsideBurgermenu = (event?: any) => {
      if (isBurgerMenuVisible === true && !isTargetWithinMenu(event.target)) {
        toggleBurgerMenu(false);
      }
    };

    document.addEventListener('keyup', onTab);
    document.addEventListener('click', onClickOutsideBurgermenu);
    return () => {
      document.removeEventListener('keyup', onTab);
      document.removeEventListener('click', onClickOutsideBurgermenu);
    };
  }, [hasBurgerMenu, isBurgerMenuVisible]);

  // Hides small screen menu on route change
  useEffect(() => {
    toggleBurgerMenu(false);
  }, [location.pathname]);

  const replaceResultUrl = useCallback((result: SearchEntry) => {
    return result.url.startsWith(AppRoutes.BUURT);
  }, []);

  const { linkContainerAnimationProps, backdropAnimationProps, leftProps } =
    useBurgerMenuAnimation(isBurgerMenuVisible);

  const isSimpleNavBarEnabled = isUiElementVisible(
    profileType,
    'MainNavBarSimple'
  );

  const menuItemsComposed = useMemo(() => {
    if (isSimpleNavBarEnabled) {
      return [];
    }
    return mainMenuItems
      .filter((menuItem) => isMenuItemVisible(profileType, menuItem))
      .map((item) => {
        let menuItem = item;

        // Add dynamic thema submenu items to the menu
        if (item.id === mainMenuItemId.CHAPTERS) {
          menuItem = { ...item, submenuItems: myChapterItems };
        } else if (
          menuItem.title === ChapterTitles.BUURT &&
          profileType !== 'private'
        ) {
          menuItem = {
            ...menuItem,
            title: termReplace(menuItem.title),
          };
        }

        return getMenuItem(menuItem);
      });
  }, [myChapterItems, profileType, termReplace, isSimpleNavBarEnabled]);

  return (
    <nav className={styles.MainNavBar}>
      {hasBurgerMenu && (
        <BurgerButton
          isActive={!!isBurgerMenuVisible}
          toggleBurgerMenu={toggleBurgerMenu}
        />
      )}

      {isAuthenticated && (
        <>
          {hasBurgerMenu && (
            <animated.div
              key="BurgerMenuBackDrop"
              style={{
                ...leftProps,
                ...backdropAnimationProps,
              }}
              className={styles.Backdrop}
            />
          )}
          <animated.div
            key="LinkContainer"
            id={LinkContainerId}
            className={styles.LinkContainer}
            style={linkContainerAnimationProps}
          >
            {hasBurgerMenu && (
              <div className={styles.LogoAndButtonWrapper}>
                <AmsterdamLogo
                  role="img"
                  aria-label="Gemeente Amsterdam logo"
                  className={styles.logo}
                />
                <BurgerButton
                  isActive={!!isBurgerMenuVisible}
                  toggleBurgerMenu={toggleBurgerMenu}
                />
              </div>
            )}

            <SecondaryLinks />
            {menuItemsComposed}
          </animated.div>
        </>
      )}

      {!isSimpleNavBarEnabled && (
        <div className={styles.InfoButtons}>
          {FeatureToggle.isSearchEnabled && isDisplayLiveSearch && (
            <IconButton
              aria-label="Zoeken in mijn amsterdam"
              className={styles.SearchButton}
              onClick={() => {
                setSearchActive(!isSearchActive);
              }}
              icon={isSearchActive ? IconClose : IconSearch}
            />
          )}
        </div>
      )}

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
    </nav>
  );
}
