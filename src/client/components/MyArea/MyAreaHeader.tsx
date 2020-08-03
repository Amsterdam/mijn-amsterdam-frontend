import React from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { IconClose } from '../../assets/icons';
import { ReactComponent as Logo } from '../../assets/images/logo-amsterdam.svg';
import Linkd from '../Button/Button';
import styles from './MyArea.module.scss';

export default function MyAreaHeader() {
  return (
    <div className={styles.Header}>
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
        <h1 className={styles.Title}>Mijn buurt</h1>
      </Link>
      <Linkd iconPosition="right" icon={IconClose} href={AppRoutes.ROOT}>
        Sluit kaart
      </Linkd>
    </div>
  );
}
