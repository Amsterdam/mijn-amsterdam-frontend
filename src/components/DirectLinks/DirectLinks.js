import React from 'react';
import styles from './DirectLinks.module.scss';
import { LINKS } from './DirectLinks.constants';
import { ReactComponent as OutsideLink } from 'assets/icons/Outside-Link.svg';

export default function DirectLinks() {
  return (
    <div className={styles.DirectLinks}>
      <div className={styles.InnerContainer}>
        <h2>Direct naar</h2>
        <ul className={styles.LinkList}>
          {Object.keys(LINKS).map(link => {
            const { url, displayName } = LINKS[link];
            return (
              <li key={link}>
                <a href={url}>
                  <OutsideLink />
                  {displayName}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
