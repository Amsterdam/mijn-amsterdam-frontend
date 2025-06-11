import React from 'react';

import { PageHeader, Icon } from '@amsterdam/design-system-react';
import { CloseIcon, SearchIcon } from '@amsterdam/design-system-react-icons';
import classNames from 'classnames';
import { useLocation, useNavigate } from 'react-router';

import styles from './MainHeader.module.scss';
import { OtapLabel } from './OtapLabel';
import { ProfileName } from './ProfileName';
import { SearchBar } from './SearchBar';
import { useMainHeaderControl } from './useMainHeaderControl.hook';
import { LOGOUT_URL } from '../../config/api';
import { useSmallScreen } from '../../hooks/media.hook';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { DashboardRoute } from '../../pages/Dashboard/Dashboard-routes';
import { SearchPageRoute } from '../../pages/Search/Search-routes';
import { routeConfig as profileRouteConfig } from '../../pages/Thema/Profile/Profile-thema-config';
import { MainMenu } from '../MainMenu/MainMenu';
import { MaLink, MaRouterLink } from '../MaLink/MaLink';
import {
  useDisplayLiveSearch,
  useSearchActive,
  useSearchOnPage,
} from '../Search/useSearch';

export const AmsMainMenuClassname = 'ma-main-header';

type MainHeaderSecondaryLinksProps = {
  linkClassName: string;
  wrapInListElement: boolean;
};

export function MainHeaderSecondaryLinks({
  linkClassName,
  wrapInListElement = false,
}: MainHeaderSecondaryLinksProps) {
  const Wrap = wrapInListElement ? 'li' : React.Fragment;
  const profileType = useProfileTypeValue();
  return (
    <>
      <Wrap>
        <MaRouterLink
          maVariant="noUnderline"
          href={
            profileType === 'private'
              ? profileRouteConfig.themaPageBRP.path
              : profileRouteConfig.themaPageKVK.path
          }
          className={linkClassName}
          title="Ga naar persoonlijke gegevens"
        >
          <span className={styles.ProfileNameInner}>
            <ProfileName fallbackName="Mijn gegevens" />
          </span>
        </MaRouterLink>
      </Wrap>
      <Wrap>
        <MaLink
          maVariant="noUnderline"
          href={LOGOUT_URL}
          className={linkClassName}
          rel="noopener noreferrer"
        >
          Uitloggen
        </MaLink>
      </Wrap>
    </>
  );
}

function MainHeaderLinks() {
  const [isSearchActive, setSearchActive] = useSearchActive();
  const isDisplayLiveSearch = useDisplayLiveSearch();
  const isPhoneScreen = useSmallScreen();

  return (
    <>
      {isDisplayLiveSearch && (
        <li>
          <MaLink
            maVariant="noUnderline"
            className={classNames(
              'ams-button',
              'ams-button--tertiary',
              styles.MainHeaderSecondaryLink,
              isSearchActive && styles.SearchButtonActive
            )}
            onClick={(e) => {
              e.preventDefault();
              setSearchActive(!isSearchActive);
            }}
            href={SearchPageRoute.route}
          >
            {!isPhoneScreen ? 'Zoeken' : ''}
            <Icon
              svg={isSearchActive ? CloseIcon : SearchIcon}
              size="heading-5"
            />
          </MaLink>
        </li>
      )}
      {!isPhoneScreen && (
        <MainHeaderSecondaryLinks
          wrapInListElement
          linkClassName={`ams-button ams-button--tertiary ${styles.MainHeaderSecondaryLink}`}
        />
      )}
    </>
  );
}

function MainHeaderSearch() {
  const { isSearchActive, setSearchActive, isDisplayLiveSearch } =
    useSearchOnPage();

  return (
    isDisplayLiveSearch &&
    isSearchActive && (
      <div className={styles.SearchBarWrap}>
        <SearchBar
          onFinish={() => setSearchActive(false)}
          className={styles.SearchBar}
        />
      </div>
    )
  );
}

type MainHeaderMenuOverlayProps = {
  isMainMenuOpen: boolean;
  headerHeight: number;
  closeMenuAndSearch: () => void;
};

function MainHeaderMenuOverlay({
  isMainMenuOpen,
  headerHeight,
  closeMenuAndSearch,
}: MainHeaderMenuOverlayProps) {
  return (
    isMainMenuOpen &&
    headerHeight !== 0 && (
      <div
        onClick={closeMenuAndSearch}
        style={{ top: headerHeight }}
        className={styles.MainMenuOverlay}
      />
    )
  );
}

export interface MainHeaderProps {
  isAuthenticated?: boolean;
}

export function MainHeader({ isAuthenticated = false }: MainHeaderProps) {
  const {
    ref,
    isMainMenuOpen,
    isSearchActive,
    closeMenuAndSearch,
    headerHeight,
  } = useMainHeaderControl();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <PageHeader
        ref={ref}
        className={classNames(styles.MainHeader, AmsMainMenuClassname)}
        logoLink={DashboardRoute.route}
        logoAccessibleName="Logo van de gemeente Amsterdam"
        logoLinkTitle="Ga naar de homepage van Mijn Amsterdam"
        logoLinkComponent={function LogoLinkComponent({ children, ...props }) {
          return (
            <a
              {...props}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                navigate(DashboardRoute.route);
                if (
                  (isSearchActive || isMainMenuOpen) &&
                  location.pathname === DashboardRoute.route
                ) {
                  closeMenuAndSearch();
                }
              }}
            >
              {children}
            </a>
          );
        }}
        brandName={
          (
            <>
              Mijn Amsterdam
              <OtapLabel />
            </>
          ) as unknown as string // Hack because brandName is not typed as ReactNode
        }
        menuItems={<>{isAuthenticated && <MainHeaderLinks />}</>}
      >
        {isAuthenticated && <MainMenu />}
      </PageHeader>
      <MainHeaderMenuOverlay
        isMainMenuOpen={isMainMenuOpen}
        closeMenuAndSearch={closeMenuAndSearch}
        headerHeight={headerHeight}
      />
      {isAuthenticated && <MainHeaderSearch />}
    </>
  );
}
