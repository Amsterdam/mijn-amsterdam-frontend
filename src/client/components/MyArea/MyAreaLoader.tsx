import React from 'react';
import { IconHome, IconHomeCommercial } from '../../assets/icons';
import styles from './MyAreaLoader.module.scss';
import { useProfileTypeValue } from '../../hooks/useProfileType';

export default function MyAreaLoader() {
  const profileType = useProfileTypeValue();
  return (
    <div className={styles.MyAreaLoader}>
      <span>
        {profileType === 'private' ? (
          <IconHome aria-hidden="true" />
        ) : (
          <IconHomeCommercial aria-hidden="true" />
        )}
        Uw adres wordt opgezocht...
      </span>
    </div>
  );
}
