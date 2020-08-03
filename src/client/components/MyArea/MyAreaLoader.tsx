import React from 'react';
import { IconHome } from '../../assets/icons';
import styles from './MyAreaLoader.module.scss';

export default function MyAreaLoader() {
  return (
    <div className={styles.MyAreaLoader}>
      <span>
        <IconHome aria-hidden="true" />
        Uw adres wordt opgezocht...
      </span>
    </div>
  );
}
