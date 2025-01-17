import {
  Button,
  Grid,
  Heading,
  Logo,
  Screen,
} from '@amsterdam/design-system-react';
import { CloseIcon, MenuIcon } from '@amsterdam/design-system-react-icons';
import { animated } from '@react-spring/web';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import styles from './MainHeader.module.scss';
import { OtapLabel } from './OtapLabel';
import { ProfileName } from './ProfileName';
import { SearchBar } from './SearchBar';
import { useMainHeaderData } from './useMainHeaderData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { IconSearch } from '../../assets/icons';
import { ErrorMessages } from '../../components';
import { LOGOUT_URL } from '../../config/api';
import { useSessionValue } from '../../hooks/api/useSessionApi';
import { MainMenu } from '../MainMenu/MainMenu';
import { MaButtonLink, MaButtonRouterLink } from '../MaLink/MaLink';

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

  const session = useSessionValue();
  const showIcons = !isPhoneScreen;

  return (
    <>
      <div className={styles.MainHeaderWrap}>
        <Screen>
          <Grid
            className={classNames(styles.HeaderGridPadding, 'ma-main-header')}
          >
            <Grid.Cell span={4}>
              <NavLink to="/" className={styles.LogoWrap}>
                <Logo />
                <Heading level={1} size="level-3">
                  Mijn Amsterdam
                </Heading>
              </NavLink>
            </Grid.Cell>
            {isAuthenticated && (
              <Grid.Cell className={styles.SecondaryLinks} start={5} span={8}>
                {isDisplayLiveSearch && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchActive(!isSearchActive);
                    }}
                    icon={IconSearch}
                    variant="tertiary"
                  >
                    Zoeken
                  </Button>
                )}

                <MaButtonRouterLink variant="tertiary" href={AppRoutes.BRP}>
                  <span className={styles.ProfileNameInner}>
                    <ProfileName />
                  </span>
                </MaButtonRouterLink>

                <MaButtonLink
                  variant="tertiary"
                  href={LOGOUT_URL}
                  className={styles.SecondaryLink}
                  onClick={(event) => {
                    event.preventDefault();
                    session.logout();
                    return false;
                  }}
                >
                  {/* {showIcons && <Icon size="level-5" svg={LogoutIcon} />}{' '} */}
                  Uitloggen
                </MaButtonLink>

                <Button
                  variant="tertiary"
                  onClick={(e) => {
                    toggleBurgerMenu(!isBurgerMenuVisible);
                  }}
                  icon={isBurgerMenuVisible ? CloseIcon : MenuIcon}
                >
                  Menu
                </Button>
              </Grid.Cell>
            )}

            <OtapLabel />
            {isDisplayLiveSearch && isSearchActive && isAuthenticated && (
              <Grid.Cell start={2} span={9}>
                <SearchBar onFinish={() => setSearchActive(false)} />
              </Grid.Cell>
            )}

            {isAuthenticated && hasErrors && (
              <ErrorMessages errors={errors} className={styles.ErrorMessages} />
            )}
          </Grid>
        </Screen>
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
