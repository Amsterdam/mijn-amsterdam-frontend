import { default as AmsterdamLogo } from '../../assets/images/logo-amsterdam.svg?react';
import { SecondaryLinks } from './MainNavBar';
import styles from './MainNavBar.module.scss';

const LinkContainerId = 'MainMenu';

export default function MainNavBar({
  isAuthenticated = false,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <nav className={styles.MainNavBarSimple}>
      {isAuthenticated && (
        <>
          <div id={LinkContainerId} className={styles.LinkContainer}>
            <div className={styles.LogoAndButtonWrapper}>
              <AmsterdamLogo
                role="img"
                aria-label="Gemeente Amsterdam logo"
                className={styles.logo}
              />
            </div>
            <SecondaryLinks />
          </div>
        </>
      )}
    </nav>
  );
}
