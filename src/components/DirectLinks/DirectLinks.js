import React from 'react';
import styles from './DirectLinks.module.scss';
import { LINKS } from './DirectLinks.constants';
import { ReactComponent as ExternalLinkIcon } from 'assets/icons/External-Link.svg';

export default function DirectLinks() {
  return (
    <div className={styles.DirectLinks}>
      <h2>Direct naar</h2>
      <ul className={styles.LinkList}>
        {Object.keys(LINKS).map(link => {
          const { url, displayName } = LINKS[link];
          return (
            <li key={link}>
              <a href={url}>
                <ExternalLinkIcon />
                {displayName}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
