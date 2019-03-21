import React from 'react';
import styles from './MainFooter.module.scss';

export default function MainFooter() {
  return (
    <footer className={styles.MainFooter}>
      <div className={styles.InnerContainer}>top</div>
      <div className={styles.BottomBar}>
        <div className={styles.InnerContainer}>bottom</div>
      </div>
    </footer>
  );
}
