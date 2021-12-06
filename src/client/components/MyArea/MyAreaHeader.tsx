import classnames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config';
import { ChapterTitles } from '../../../universal/config/chapter';
import { IconClose, IconSearch } from '../../assets/icons';
import { ReactComponent as Logo } from '../../assets/images/logo-amsterdam.svg';
import { trackEventWithProfileType, usePhoneScreen } from '../../hooks';
import { useTabletScreen } from '../../hooks/media.hook';
import { useKeyUp } from '../../hooks/useKey';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import Linkd, { IconButton, Button } from '../Button/Button';
import mainHeaderStyles from '../MainHeader/MainHeader.module.scss';
import { Search } from '../Search/Search';
import styles from './MyArea.module.scss';

interface MyAreaHeaderProps {
  showCloseButton?: boolean;
}

export default function MyAreaHeader({
  showCloseButton = true,
}: MyAreaHeaderProps) {
  const history = useHistory();
  const location = useLocation();
  const isSmallScreen = useTabletScreen();
  const termReplace = useTermReplacement();
  const [isSearchActive, setSearchActive] = useState(false);

  const profileType = useProfileTypeValue();
  const trackSearchBarEvent = useCallback(
    (action: string) =>
      trackEventWithProfileType(
        {
          category: 'Zoeken',
          name: 'Zoekbalk open/dicht',
          action,
        },
        profileType
      ),
    [profileType]
  );
  useKeyUp((event) => {
    if (event.key === 'z' && !isSearchActive) {
      setSearchActive(true);
      trackSearchBarEvent('Openen met z toets');
    }
  });
  useEffect(() => {
    setSearchActive(false);
    if (isSearchActive) {
      trackSearchBarEvent('Automatisch sluiten (navigatie)');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, trackSearchBarEvent]);
  return (
    <>
      <div className={styles.Header}>
        {!usePhoneScreen() && (
          <nav
            className={classnames(
              mainHeaderStyles.DirectSkipLinks,
              styles.DirectSkipLinks
            )}
          >
            <Linkd external={true} tabIndex={0} href="#skip-to-id-LegendPanel">
              Direct naar: <b>Legenda paneel</b>
            </Linkd>
          </nav>
        )}
        <Link
          className={styles.LogoLink}
          to={AppRoutes.ROOT}
          title="Terug naar home"
        >
          <Logo
            role="img"
            aria-label="Gemeente Amsterdam logo"
            className={styles.Logo}
          />
          <h1 className={styles.Title}>{termReplace(ChapterTitles.BUURT)}</h1>
        </Link>
        {!isSmallScreen && (
          <div className={styles.SearchBar}>
            <div className={styles.SearchBarInner}>
              <Search
                setVisible={(value: boolean) => {
                  setSearchActive(value);
                }}
                isActive={isSearchActive}
                onFinish={(reason) => {
                  if (reason) {
                    setSearchActive(false);
                    if (reason) {
                      trackSearchBarEvent(`Automatisch sluiten (${reason})`);
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
        {isSmallScreen && (
          <div className={styles.CloseWrapper}>
            <IconButton
              icon={isSearchActive ? IconClose : IconSearch}
              onClick={() => {
                setSearchActive(!isSearchActive);
              }}
            />
          </div>
        )}
        {isSmallScreen ? (
          <IconButton
            icon={IconClose}
            onClick={() => {
              history.push(AppRoutes.ROOT);
            }}
          />
        ) : (
          <Button
            onClick={() => {
              history.push(AppRoutes.ROOT);
            }}
          >
            Kaart sluiten
          </Button>
        )}
      </div>
      {isSmallScreen && isSearchActive && (
        <div className={styles.Search}>
          <div className={styles.SearchBarInner}>
            <div className={styles.SearchBar}>
              <Search
                setVisible={(value: boolean) => {
                  setSearchActive(value);
                }}
                maxResultCountDisplay={10}
                isActive={isSearchActive}
                onFinish={(reason) => {
                  if (reason) {
                    setSearchActive(false);
                    if (reason) {
                      trackSearchBarEvent(`Automatisch sluiten (${reason})`);
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
