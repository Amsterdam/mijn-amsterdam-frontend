import React from 'react';
import styles from './DirectLinks.module.scss';
import { LINKS } from './DirectLinks.constants';
import { ReactComponent as ExternalLinkIcon } from 'assets/icons/External-Link.svg';

export default function DirectLinks({ title }) {
  return (
    <div className={styles.DirectLinks}>
      <h2>{title}</h2>
      <ul className={styles.LinkList}>
        {Object.entries(LINKS).map(link => {
          const [linkName, { url, title }] = link;
          return (
            <li key={linkName}>
              <a href={url}>
                <ExternalLinkIcon />
                {title}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
