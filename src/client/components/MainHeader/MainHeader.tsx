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

import styles from './MainHeader.module.scss';
import { OtapLabel } from './OtapLabel';
import { useMainHeaderData } from './useMainHeaderData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { isLoading } from '../../../universal/helpers/api';
import { getFullName } from '../../../universal/helpers/brp';
import { IconSearch } from '../../assets/icons';
import { ErrorMessages, LoadingContent } from '../../components';
import { LOGOUT_URL } from '../../config/api';
import { useSessionValue } from '../../hooks/api/useSessionApi';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { MainMenu } from '../MainMenu/MainMenu';
import { MaButtonLink } from '../MaLink/MaLink';
import { Search } from '../Search/Search';

export interface MainHeaderProps {
  isAuthenticated?: boolean;
}

export default function MainHeader({
  isAuthenticated = false,
}: MainHeaderProps) {
  const {
    backdropRef,
    errors,
    fadeStyles,
    hasErrors,
    isBurgerMenuVisible,
    isDisplayLiveSearch,
    isPhoneScreen,
    isSearchActive,
    menuItems,
    myThemasMenuItems,
    replaceResultUrl,
    setSearchActive,
    toggleBurgerMenu,
  } = useMainHeaderData();

  const { BRP, KVK } = useAppStateGetter();
  const session = useSessionValue();
  const profileType = useProfileTypeValue();
  const showIcons = !isPhoneScreen;

  const persoon = BRP.content?.persoon;

  const labelCommercial =
    KVK.content?.onderneming.handelsnaam || 'Mijn onderneming';
  const labelPrivate = persoon?.opgemaakteNaam
    ? persoon.opgemaakteNaam
    : persoon?.voornamen
      ? getFullName(persoon)
      : 'Mijn gegevens';

  return (
    <>
      <div className={styles.MainHeaderWrap}>
        <Screen>
          <Grid
            className={classNames(styles.HeaderGridPadding, 'ma-main-header')}
          >
            <Grid.Cell span={1}>
              <Logo />
            </Grid.Cell>
            <Grid.Cell start={2} span={3}>
              <Heading level={1} size="level-3">
                Mijn Amsterdam
              </Heading>
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

                <MaButtonLink variant="tertiary" href={AppRoutes.BRP}>
                  <span className={styles.ProfileNameInner}>
                    {profileType === 'private' &&
                      !isLoading(BRP) &&
                      labelPrivate}
                    {profileType === 'commercial' &&
                      !isLoading(KVK) &&
                      labelCommercial}
                    {((profileType === 'commercial' && isLoading(KVK)) ||
                      (profileType === 'private' && isLoading(BRP))) && (
                      <LoadingContent barConfig={[['200px', '20px', '0']]} />
                    )}
                  </span>
                </MaButtonLink>

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
              <div className={styles.SearchBar}>
                <div className={styles.SearchBarInner}>
                  <Search
                    onFinish={() => {
                      setSearchActive(false);
                    }}
                    replaceResultUrl={replaceResultUrl}
                  />
                </div>
              </div>
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
        ref={backdropRef}
        key="BurgerMenuBackDrop"
        className={styles.Backdrop}
        style={fadeStyles}
      />
    </>
  );
}
