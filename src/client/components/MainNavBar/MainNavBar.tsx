import classnames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { matchPath, NavLink, useLocation } from 'react-router-dom';
import { animated } from 'react-spring';
import { AppRoutes } from '../../../universal/config';
import { ChapterTitles } from '../../../universal/config/chapter';
import { isError } from '../../../universal/helpers/api';
import { ComponentChildren } from '../../../universal/types';
import { IconClose, IconSearch } from '../../assets/icons';
import { ChapterIcons } from '../../config/chapterIcons';
import { trackItemPresentation } from '../../hooks/analytics.hook';
import { useMediaQueryContext } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useChapters } from '../../hooks/useChapters';
import { useKeyUp } from '../../hooks/useKey';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import { IconButton } from '../Button/Button';
import FontEnlarger from '../FontEnlarger/FontEnlarger';
import LogoutLink from '../LogoutLink/LogoutLink';
import MainNavSubmenu, {
  MainNavSubmenuLink,
} from '../MainNavSubmenu/MainNavSubmenu';
import { Search } from '../Search/Search';
import {
  mainMenuItemId,
  mainMenuItems,
  MenuItem,
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

function SecondaryLinks() {
  const { BRP, KVK } = useAppStateGetter();
  const persoon = BRP.content?.persoon || null;
  const hasFirstName = !!(persoon && persoon.voornamen);
  const { isDesktopScreen } = useMediaQueryContext();
  const profileType = useProfileTypeValue();

  useEffect(() => {
    if (hasFirstName) {
      trackItemPresentation('Mijn gegevens', 'Link naar Profiel', profileType);
    }
  }, [hasFirstName, profileType]);

  return (
    <div className={styles.secondaryLinks}>
      {isDesktopScreen && <FontEnlarger />}
      {!isError(BRP) && !isError(KVK) && (
        <ProfileName
          person={BRP.content?.persoon}
          company={KVK.content}
          profileType={profileType}
        />
      )}
      <LogoutLink>Uitloggen</LogoutLink>
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
              Icon={ChapterIcons[id]}
              data-chapter-id={id}
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
  const { isTabletScreen } = useMediaQueryContext();
  const hasBurgerMenu = isTabletScreen;
  const termReplace = useTermReplacement();
  const [isBurgerMenuVisible, toggleBurgerMenu] = useState<boolean | undefined>(
    undefined
  );
  const { items: myChapterItems } = useChapters();
  const location = useLocation();
  const profileType = useProfileTypeValue();

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

  const { linkContainerAnimationProps, backdropAnimationProps, leftProps } =
    useBurgerMenuAnimation(isBurgerMenuVisible);

  const menuItemsComposed = useMemo(() => {
    return mainMenuItems.map((item) => {
      let menuItem = item;

      // Add dynamic chapter submenu items to the menu
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
  }, [myChapterItems, profileType, termReplace]);

  const [isSearchActive, setSearchActive] = useState(false);
  const isDisplaySearch = !matchPath(location.pathname, {
    path: AppRoutes.SEARCH,
  });

  useKeyUp((event) => {
    if (event.key === 'z' && !isSearchActive) {
      setSearchActive(true);
    }
  });

  useEffect(() => {
    setSearchActive(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isSearchActive) {
      document.body.classList.add('is-typeAheadActive');
    } else {
      document.body.classList.remove('is-typeAheadActive');
    }
  }, [isSearchActive]);

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
            {menuItemsComposed}
            <SecondaryLinks />
          </animated.div>
        </>
      )}
      <div className={styles.InfoButtons}>
        {isDisplaySearch && (
          <IconButton
            className={styles.SearchButton}
            onClick={() => setSearchActive(!isSearchActive)}
            icon={isSearchActive ? IconClose : IconSearch}
          />
        )}
      </div>
      {isDisplaySearch && isSearchActive && (
        <div className={styles.Search}>
          <div className={styles.SearchBar}>
            <div className={styles.SearchBarInner}>
              <Search onFinish={() => setSearchActive(false)} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
