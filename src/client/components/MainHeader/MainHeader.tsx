import { useMemo } from 'react';

import { Header, Icon, Screen } from '@amsterdam/design-system-react';
import { CloseIcon, SearchIcon } from '@amsterdam/design-system-react-icons';

import styles from './MainHeader.module.scss';
import { ProfileName } from './ProfileName';
import { SearchBar } from './SearchBar';
import { useCloseMenu } from './useCloseMenu.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { getApiErrors, LOGOUT_URL } from '../../config/api';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import { ErrorMessages } from '../ErrorMessages/ErrorMessages';
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

function MainHeaderSecondary() {
  const appState = useAppStateGetter();
  const errors = useMemo(() => getApiErrors(appState), [appState]);
  const hasErrors = !!errors.length;
  const { isSearchActive, setSearchActive, isDisplayLiveSearch } =
    useSearchOnPage();

  return (
    <>
      {hasErrors && (
        <div className={styles.ErrorMessagesWrap}>
          <ErrorMessages errors={errors} />
        </div>
      )}
      {isDisplayLiveSearch && isSearchActive && (
        <div className={styles.SearchBarWrap}>
          <SearchBar
            onFinish={() => setSearchActive(false)}
            className={styles.SearchBar}
          />
        </div>
      )}
    </>
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
      <Screen className={styles.MainHeaderWrap}>
        <Header
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
      </Screen>
      {isAuthenticated && (
        <div className={styles.MainHeaderWrap}>
          <MainHeaderSecondary />
        </div>
      )}
    </>
  );
}
