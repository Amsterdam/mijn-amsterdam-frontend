import React from 'react';

import { Header, Icon } from '@amsterdam/design-system-react';
import { CloseIcon, SearchIcon } from '@amsterdam/design-system-react-icons';
import classNames from 'classnames';

import styles from './MainHeader.module.scss';
import { ProfileName } from './ProfileName';
import { SearchBar } from './SearchBar';
import { useMainHeaderControl } from './useMainHeaderControl.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { LOGOUT_URL } from '../../config/api';
import { usePhoneScreen } from '../../hooks/media.hook';
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
  return (
    <>
      <Wrap>
        <MaRouterLink
          maVariant="noUnderline"
          href={AppRoutes.BRP}
          className={linkClassName}
          title="Ga naar persoonlijke gegevens"
        >
          <span className={styles.ProfileNameInner}>
            <ProfileName fallbackName="Profiel" />
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
  const isPhoneScreen = usePhoneScreen();

  return (
    <>
      {isDisplayLiveSearch && (
        <li>
          <MaLink
            maVariant="noUnderline"
            className={classNames(
              'ams-button',
              isSearchActive && styles.SearchButtonActive
            )}
            onClick={(e) => {
              e.preventDefault();
              setSearchActive(!isSearchActive);
            }}
            href={AppRoutes.SEARCH}
          >
            {!isPhoneScreen ? 'Zoeken' : ''}
            <Icon
              svg={isSearchActive ? CloseIcon : SearchIcon}
              size="level-5"
            />
          </MaLink>
        </li>
      )}
      {!isPhoneScreen && (
        <MainHeaderSecondaryLinks
          wrapInListElement
          linkClassName="ams-button"
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
  const { ref, isMainMenuOpen, closeMenuAndSearch, headerHeight } =
    useMainHeaderControl();

  return (
    <>
      <Header
        ref={ref}
        className={classNames(styles.MainHeader, AmsMainMenuClassname)}
        logoLink="https://www.amsterdam.nl/"
        brandName={
          (
            <MaRouterLink
              className={styles.BrandNameLink}
              href={AppRoutes.HOME}
            >
              Mijn Amsterdam
            </MaRouterLink>
          ) as unknown as string // Hack because brandName is not typed as ReactNode
        }
        menuItems={<>{isAuthenticated && <MainHeaderLinks />}</>}
      >
        {isAuthenticated && <MainMenu />}
      </Header>
      <MainHeaderMenuOverlay
        isMainMenuOpen={isMainMenuOpen}
        closeMenuAndSearch={closeMenuAndSearch}
        headerHeight={headerHeight}
      />
      {isAuthenticated && <MainHeaderSearch />}
    </>
  );
}
