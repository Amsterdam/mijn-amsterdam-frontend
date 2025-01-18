import {
  Grid,
  Heading,
  Icon,
  Logo,
  Screen,
} from '@amsterdam/design-system-react';
import {
  CloseIcon,
  MenuIcon,
  SearchIcon,
} from '@amsterdam/design-system-react-icons';
import { animated } from '@react-spring/web';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import styles from './MainHeader.module.scss';
import { OtapLabel } from './OtapLabel';
import { ProfileName } from './ProfileName';
import { SearchBar } from './SearchBar';
import { useMainHeaderData } from './useMainHeaderData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { ErrorMessages } from '../../components';
import { LOGOUT_URL } from '../../config/api';
import { MainMenu } from '../MainMenu/MainMenu';
import { MaLink, MaRouterLink } from '../MaLink/MaLink';

export interface MainHeaderProps {
  isAuthenticated?: boolean;
}

export default function MainHeader({
  isAuthenticated = false,
}: MainHeaderProps) {
  const {
    errors,
    fadeStyles,
    hasErrors,
    isBurgerMenuVisible,
    isDisplayLiveSearch,
    isPhoneScreen,
    isSearchActive,
    menuItems,
    myThemasMenuItems,
    setSearchActive,
    toggleBurgerMenu,
  } = useMainHeaderData();

  return (
    <>
      <div className={styles.MainHeaderWrap}>
        <Screen>
          <Grid
            className={classNames(styles.HeaderGridPadding, 'ma-main-header')}
          >
            <Grid.Cell span={4} className={styles.TopCell}>
              <NavLink to="/" className={styles.LogoWrap}>
                <Logo />
                <Heading level={1} size="level-3">
                  Mijn Amsterdam
                </Heading>
              </NavLink>
            </Grid.Cell>
            {isAuthenticated && (
              <Grid.Cell className={styles.TopCell} start={5} span={8}>
                {isDisplayLiveSearch && (
                  <MaLink
                    onClick={(e) => {
                      e.preventDefault();
                      setSearchActive(!isSearchActive);
                    }}
                    href={AppRoutes.SEARCH}
                    maVariant="noDefaultUnderline"
                    className="ams-button"
                  >
                    Zoeken{' '}
                    <Icon
                      svg={isSearchActive ? CloseIcon : SearchIcon}
                      size="level-5"
                    />
                  </MaLink>
                )}

                <MaRouterLink
                  maVariant="noDefaultUnderline"
                  href={AppRoutes.BRP}
                  className="ams-button"
                >
                  <span className={styles.ProfileNameInner}>
                    <ProfileName />
                  </span>
                </MaRouterLink>

                <MaLink
                  maVariant="noDefaultUnderline"
                  href={LOGOUT_URL}
                  className="ams-button"
                >
                  Uitloggen
                </MaLink>

                <MaLink
                  maVariant="noDefaultUnderline"
                  href={AppRoutes.ROOT}
                  className="ams-button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleBurgerMenu(!isBurgerMenuVisible);
                  }}
                >
                  Menu{' '}
                  <Icon
                    svg={isBurgerMenuVisible ? CloseIcon : MenuIcon}
                    size="level-5"
                  />
                </MaLink>
              </Grid.Cell>
            )}

            <OtapLabel />
          </Grid>
        </Screen>
        {isAuthenticated && hasErrors && (
          <div className={styles.ErrorMessagesWrap}>
            <ErrorMessages errors={errors} />
          </div>
        )}
        {isDisplayLiveSearch && isSearchActive && isAuthenticated && (
          <div className={styles.SearchBarWrap}>
            <SearchBar
              onFinish={() => setSearchActive(false)}
              className={styles.SearchBar}
            />
          </div>
        )}
      </div>

      {isBurgerMenuVisible && (
        <div className={styles.MainMenuWrap}>
          <Screen>
            <Grid>
              <Grid.Cell span="all">
                <MainMenu
                  isPhoneScreen={isPhoneScreen}
                  themas={myThemasMenuItems}
                  menuItems={menuItems}
                />
              </Grid.Cell>
            </Grid>
          </Screen>
        </div>
      )}

      <animated.div
        key="BurgerMenuBackDrop"
        className={styles.Backdrop}
        style={fadeStyles}
      />
    </>
  );
}
