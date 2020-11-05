import React from 'react';
import { IconHome, MapIconHomeCommercial } from '../../assets/icons';
import styles from './MyAreaLoadingIndicator.module.scss';
import { useProfileTypeValue } from '../../hooks/useProfileType';

export default function MyAreaLoadingIndicator() {
  const profileType = useProfileTypeValue();
  return (
    <div className={styles.MyAreaLoader}>
      <span>
        {profileType === 'private' ? (
          <IconHome aria-hidden="true" />
        ) : (
          <MapIconHomeCommercial aria-hidden="true" />
        )}
        Uw adres wordt opgezocht...
      </span>
    </div>
  );
}
