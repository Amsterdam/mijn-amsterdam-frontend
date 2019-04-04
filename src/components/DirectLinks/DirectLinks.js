import React from 'react';
import styles from './DirectLinks.module.scss';
import { LINKS } from './DirectLinks.constants';
import Heading from 'components/Heading/Heading';
import { ReactComponent as ExternalLinkIcon } from 'assets/icons/External-Link.svg';

export default function DirectLinks() {
  return (
    <div className={styles.DirectLinks}>
      <Heading size="large">Direct naar</Heading>
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
