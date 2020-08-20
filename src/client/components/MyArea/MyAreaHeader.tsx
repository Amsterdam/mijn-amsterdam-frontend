import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { ReactComponent as Logo } from '../../assets/images/logo-amsterdam.svg';
import { Button } from '../Button/Button';
import styles from './MyArea.module.scss';

export default function MyAreaHeader() {
  const history = useHistory();
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
      <Button onClick={() => history.push(AppRoutes.ROOT)}>
        Kaart sluiten
      </Button>
    </div>
  );
}
