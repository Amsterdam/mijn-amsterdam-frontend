import { Header, Icon } from '@amsterdam/design-system-react';
import { CloseIcon, SearchIcon } from '@amsterdam/design-system-react-icons';

import styles from './MainHeader.module.scss';
import { ProfileName } from './ProfileName';
import { SearchBar } from './SearchBar';
import { useCloseMenu } from './useCloseMenu.hook';
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

function MainHeaderLinks() {
  const [isSearchActive, setSearchActive] = useSearchActive();
  const isDisplayLiveSearch = useDisplayLiveSearch();
  const isPhoneScreen = usePhoneScreen();

  return (
    <>
      {isDisplayLiveSearch && (
        <MaLink
          maVariant="noUnderline"
          className="ams-button"
          onClick={(e) => {
            e.preventDefault();
            setSearchActive(!isSearchActive);
          }}
          href={AppRoutes.SEARCH}
        >
          {!isPhoneScreen && <>Zoeken </>}
          <Icon svg={isSearchActive ? CloseIcon : SearchIcon} size="level-5" />
        </MaLink>
      )}
      {!isPhoneScreen && (
        <>
          <MaRouterLink
            maVariant="noUnderline"
            href={AppRoutes.BRP}
            className="ams-button"
            title="Ga naar persoonlijke gegevens"
          >
            <span className={styles.ProfileNameInner}>
              <ProfileName fallbackName="Profiel" />
            </span>
          </MaRouterLink>

          <MaLink
            maVariant="noUnderline"
            href={LOGOUT_URL}
            className="ams-button"
            rel="noopener noreferrer"
          >
            Uitloggen
          </MaLink>
        </>
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

export interface MainHeaderProps {
  isAuthenticated?: boolean;
}

export function MainHeader({ isAuthenticated = false }: MainHeaderProps) {
  // Closes menu on location.pathname change, Escape key press and Search activation.
  useCloseMenu();

  return (
    <>
      <Header
        className={styles.MainHeader}
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
      {isAuthenticated && <MainHeaderSearch />}
    </>
  );
}
