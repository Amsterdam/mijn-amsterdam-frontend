import React from 'react';
import styles from './DirectLinks.module.scss';
import { LINKS } from './DirectLinks.constants';
import Heading from 'components/Heading/Heading';
import { ReactComponent as ExternalLinkIcon } from 'assets/icons/External-Link.svg';
import { entries } from 'helpers/App';
import { usePhoneScreen } from 'hooks/media.hook';
import ButtonLink from 'components/ButtonLink/ButtonLink';

export default function DirectLinks() {
  const isPhoneScreen = usePhoneScreen();
  return (
    <div className={styles.DirectLinks}>
      <Heading size="large">Andere websites</Heading>
      <ul className={styles.LinkList}>
        {entries(LINKS)
          .filter(([, { isPhoneScreenLink }]) =>
            !isPhoneScreen ? isPhoneScreenLink !== true : true
          )
          .map(link => {
            const [linkName, { url, title, isExternalLink }] = link;
            return (
              <li key={linkName}>
                {isExternalLink === true ? (
                  <a href={url}>
                    <ExternalLinkIcon />
                    {title}
                  </a>
                ) : (
                  <ButtonLink to={url}>{title}</ButtonLink>
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
}
