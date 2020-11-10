import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { ReactComponent as Logo } from '../../assets/images/logo-amsterdam.svg';
import { Button } from '../Button/Button';
import styles from './MyArea.module.scss';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import { ChapterTitles } from '../../../universal/config/chapter';

export default function MyAreaHeader() {
  const history = useHistory();
  const termReplace = useTermReplacement();
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
        <h1 className={styles.Title}>{termReplace(ChapterTitles.BUURT)}</h1>
      </Link>
      <Button onClick={() => history.goBack()}>Kaart sluiten</Button>
    </div>
  );
}
