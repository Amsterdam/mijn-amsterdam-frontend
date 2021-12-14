import classnames from 'classnames';
import { Link, useHistory } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config';
import { ChapterTitles } from '../../../universal/config/chapter';
import { IconClose, IconSearch } from '../../assets/icons';
import { ReactComponent as Logo } from '../../assets/images/logo-amsterdam.svg';
import { usePhoneScreen, useTabletScreen } from '../../hooks';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import Linkd, { Button, IconButton } from '../Button/Button';
import mainHeaderStyles from '../MainHeader/MainHeader.module.scss';
import { Search } from '../Search/Search';
import { useSearchOnPage } from '../Search/useSearch';
import styles from './MyArea.module.scss';

interface MyAreaHeaderProps {
  showCloseButton?: boolean;
}

export default function MyAreaHeader({
  showCloseButton = true,
}: MyAreaHeaderProps) {
  const history = useHistory();
  const isSmallScreen = usePhoneScreen();
  const isTabletOrSmaller = useTabletScreen();
  const termReplace = useTermReplacement();

  const { isSearchActive, setSearchActive, trackSearchBarEvent } =
    useSearchOnPage();
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
        {(!isSmallScreen || isSearchActive) && (
          <div className={styles.SearchBar}>
            <div className={styles.SearchBarInner}>
              <Search
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
        {isSmallScreen && !isSearchActive && (
          <div className={styles.CloseWrapper}>
            <IconButton
              icon={IconSearch}
              onClick={() => {
                setSearchActive(!isSearchActive);
              }}
            />
          </div>
        )}
        {isTabletOrSmaller ? (
          <IconButton
            icon={IconClose}
            onClick={() => {
              isSearchActive
                ? setSearchActive(!isSearchActive)
                : history.push(AppRoutes.ROOT);
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
    </>
  );
}
