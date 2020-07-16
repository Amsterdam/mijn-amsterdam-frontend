import classnames from 'classnames';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { Link, NavLink } from 'react-router-dom';
import { animated, useSpring } from 'react-spring';
import useRouter from 'use-react-router';
import { AppRoutes } from '../../../universal/config';
import { getFullName } from '../../../universal/helpers';
import { ComponentChildren } from '../../../universal/types';
import { AppContext } from '../../AppState';
import { IconInfo, IconProfile, IconSuitcase } from '../../assets/icons';
import { ChapterIcons } from '../../config/chapterIcons';
import { getMyChapters } from '../../helpers/chapters';
import { trackItemPresentation } from '../../hooks/analytics.hook';
import { useDesktopScreen, useTabletScreen } from '../../hooks/media.hook';
import { SessionContext } from '../../SessionState';
import Linkd, { Button } from '../Button/Button';
import FontEnlarger from '../FontEnlarger/FontEnlarger';
import LoadingContent from '../LoadingContent/LoadingContent';
import MainNavSubmenu, {
  MainNavSubmenuLink,
} from '../MainNavSubmenu/MainNavSubmenu';
import Tutorial from '../Tutorial/Tutorial';
import {
  mainMenuItemId,
  mainMenuItems,
  submenuItems,
  MenuItem,
} from './MainNavBar.constants';
import styles from './MainNavBar.module.scss';
import { BRPData } from '../../../universal/types/brp';
import { SessionData } from '../../hooks/api/api.session';
import LogoutLink from '../LogoutLink/LogoutLink';
import { KVKSourceDataContent } from '../../../server/services/kvk';
import { useCommercialProfileToggle } from '../../hooks/useCommercialProfileToggle';

const BurgerMenuToggleBtnId = 'BurgerMenuToggleBtn';
const LinkContainerId = 'MainMenu';

export interface MainNavLinkProps {
  to: string;
  children: ComponentChildren;
  title: string;
}

interface PrivateProfileNameProps {
  person?: BRPData['persoon'];
}

function PrivateProfileName({ person }: PrivateProfileNameProps) {
  return (
    <Link
      to={AppRoutes.BRP}
      className={classnames(styles.ProfileLink, styles['ProfileLink--private'])}
    >
      {person?.opgemaakteNaam ? getFullName(person) : 'Mijn gegevens'}
    </Link>
  );
}

interface CommercialProfileNameProps {
  company?: KVKSourceDataContent;
}

function CommercialProfileName({ company }: CommercialProfileNameProps) {
  return (
    <Link
      to={AppRoutes.BRP}
      className={classnames(
        styles.ProfileLink,
        styles['ProfileLink--commercial']
      )}
    >
      {company?.name || 'Mijn bedrijf'}
    </Link>
  );
}

interface PrivateCommercialProfileToggleProps {
  person?: BRPData['persoon'];
  company?: KVKSourceDataContent;
}

function PrivateCommercialProfileToggle({
  person,
  company,
}: PrivateCommercialProfileToggleProps) {
  const [isCommercial, setIsCommercial] = useCommercialProfileToggle();
  return (
    <>
      <Button
        onClick={() => setIsCommercial(false)}
        icon={IconProfile}
        variant="plain"
        lean={true}
        className={classnames(
          styles.ProfileLink,
          styles['ProfileLink--private'],
          !isCommercial && styles['ProfileLink--active']
        )}
      >
        {person?.opgemaakteNaam ? getFullName(person) : 'Mijn gegevens'}
      </Button>
      <Button
        onClick={() => setIsCommercial(true)}
        icon={IconSuitcase}
        variant="plain"
        lean={true}
        className={classnames(
          styles.ProfileLink,
          styles['ProfileLink--commercial'],
          isCommercial && styles['ProfileLink--active']
        )}
      >
        {company?.name || 'Zakelijk'}
      </Button>
    </>
  );
}

interface ProfileNameProps {
  person?: BRPData['persoon'] | null;
  company?: KVKSourceDataContent | null;
  userType?: SessionData['userType'];
}

function ProfileName({ person, company, userType }: ProfileNameProps) {
  const nameContent = useMemo(() => {
    let nameContent: undefined | string | ReactNode;
    switch (true) {
      case !!person && !company:
        nameContent = <PrivateProfileName person={person!} />;
        break;
      case !!(person && company):
        nameContent = <PrivateCommercialProfileToggle person={person!} />;
        break;
      case !person && !!company:
        nameContent = <CommercialProfileName company={company!} />;
        break;
    }
    return nameContent;
  }, [person, company]);

  return (
    <span
      data-tutorial-item="Hier ziet u uw persoonsgegevens, zoals uw adres en geboortedatum;left-bottom"
      className={classnames(
        styles.ProfileName,
        styles[`ProfileName--${userType}`]
      )}
    >
      {nameContent || <LoadingContent barConfig={[['15rem', '1rem', '0']]} />}
    </span>
  );
}

function SecondaryLinks() {
  const { BRP, KVK } = useContext(AppContext);
  const persoon = BRP.content?.persoon || null;
  const hasFirstName = !!(persoon && persoon.voornamen);
  const isDesktopScreen = useDesktopScreen();
  const session = useContext(SessionContext);

  useEffect(() => {
    if (hasFirstName) {
      trackItemPresentation('Mijn gegevens', 'Link naar Profiel');
    }
  }, [hasFirstName]);

  return (
    <div className={styles.secondaryLinks}>
      {isDesktopScreen && <FontEnlarger />}
      <ProfileName
        person={BRP.content?.persoon}
        company={KVK.content}
        userType={session.userType}
      />
      <LogoutLink>Uitloggen</LogoutLink>
    </div>
  );
}

function MainNavLink({ children, to, title, ...rest }: MainNavLinkProps) {
  return (
    <NavLink to={to} className={styles.MainNavLink} {...rest}>
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

function useBurgerMenuAnimation(isBurgerMenuVisible: boolean | undefined) {
  const config = {
    mass: 0.3,
    tension: 400,
  };

  const linkContainerAnim = {
    immediate: isBurgerMenuVisible === undefined,
    reverse: isBurgerMenuVisible,
    left: -400,
    config,
    from: {
      left: 0,
    },
  };

  const backdropAnim = {
    immediate: isBurgerMenuVisible === undefined,
    reverse: isBurgerMenuVisible,
    opacity: 0,
    from: {
      opacity: 1,
    },
  };

  const left: any = {
    immediate: isBurgerMenuVisible !== false,
    reverse: !isBurgerMenuVisible,
    left: 0,
    config,
    from: {
      left: -1000,
    },
  };

  if (!isBurgerMenuVisible) {
    left.delay = 300;
  }

  const linkContainerAnimationProps = useSpring(linkContainerAnim);
  const backdropAnimationProps = useSpring(backdropAnim);
  const leftProps = useSpring(left);

  return {
    linkContainerAnimationProps,
    backdropAnimationProps,
    leftProps,
  };
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
      onClick={() => toggleBurgerMenu(!isActive)}
    >
      Navigatie
    </button>
  );
}

export default function MainNavBar() {
  const appState = useContext(AppContext);
  const session = useContext(SessionContext);
  const { isAuthenticated } = session;
  const hasBurgerMenu = useTabletScreen();
  const [isBurgerMenuVisible, toggleBurgerMenu] = useState<boolean | undefined>(
    undefined
  );
  const { items: myChapterItems } = getMyChapters(appState);

  const { history, location } = useRouter();
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);

  const onClickOutsideBurgermenu = useCallback(
    (event?: any) => {
      if (isBurgerMenuVisible) {
        // Testing for clicks on elements that are not part of the responsive menu
        const BurgerMenuToggleButton = document.getElementById(
          BurgerMenuToggleBtnId
        );
        const LinkContainer = document.getElementById(LinkContainerId);
        const clickedOutside = !(
          (LinkContainer && LinkContainer.contains(event.target)) ||
          (BurgerMenuToggleButton &&
            BurgerMenuToggleButton.contains(event.target))
        );

        if (clickedOutside) {
          toggleBurgerMenu(false);
        }
      }
    },
    [isBurgerMenuVisible]
  );

  // Bind click outside small screen menu to hide it
  useEffect(() => {
    document.addEventListener('click', onClickOutsideBurgermenu);
    return () =>
      document.removeEventListener('click', onClickOutsideBurgermenu);
  }, [onClickOutsideBurgermenu]);

  // Hides small screen menu on route change
  useEffect(() => {
    toggleBurgerMenu(false);
  }, [history.location]);

  const {
    linkContainerAnimationProps,
    backdropAnimationProps,
    leftProps,
  } = useBurgerMenuAnimation(isBurgerMenuVisible);

  const menuItemsComposed = useMemo(() => {
    return mainMenuItems.map(item => {
      let menuItem = item;
      if (item.id in submenuItems) {
        // Add dynamic chapter submenu items to the menu
        if (item.id === mainMenuItemId.CHAPTERS) {
          menuItem = { ...item, submenuItems: myChapterItems };
        } else {
          menuItem = {
            ...item,
            submenuItems: submenuItems[item.id],
          };
        }
      }
      return getMenuItem(menuItem);
    });
  }, [myChapterItems]);

  return (
    <nav
      className={classnames(
        styles.MainNavBar,
        hasBurgerMenu && styles.BurgerMenu,
        isBurgerMenuVisible && styles.BurgerMenuVisible
      )}
    >
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
              style={{ ...leftProps, ...backdropAnimationProps }}
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

      <div
        className={classnames(
          styles.InfoButtons,
          isTutorialVisible && styles.InfoButtonsOpen
        )}
      >
        {location.pathname === AppRoutes.ROOT && (
          <>
            <Button
              className={styles.TutorialBtn}
              onClick={() => {
                setIsTutorialVisible(!isTutorialVisible);
              }}
              variant="plain"
              aria-expanded={isTutorialVisible}
              lean={true}
            >
              Rondleiding
            </Button>
            {isTutorialVisible && (
              <Tutorial
                onClose={() => setIsTutorialVisible(!isTutorialVisible)}
              />
            )}
          </>
        )}
        <Linkd
          className={styles.GeneralInfoLink}
          href={AppRoutes.GENERAL_INFO}
          variant="plain"
          icon={IconInfo}
          lean={true}
        />
      </div>
    </nav>
  );
}
