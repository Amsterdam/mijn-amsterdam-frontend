import React from 'react';
import { IconHome, MapIconHomeCommercial } from '../../assets/icons';
import styles from './MyAreaLoadingIndicator.module.scss';
import { useProfileTypeValue } from '../../hooks/useProfileType';

interface MyAreaLoadingIndicatorProps {
  label: string;
}

export default function MyAreaLoadingIndicator({
  label,
}: MyAreaLoadingIndicatorProps) {
  const profileType = useProfileTypeValue();
  return (
    <div className={styles.MyAreaLoader}>
      <span>
        {profileType === 'private' ? (
          <IconHome aria-hidden="true" />
        ) : (
          <MapIconHomeCommercial aria-hidden="true" />
        )}
        {label}
      </span>
    </div>
  );
}
