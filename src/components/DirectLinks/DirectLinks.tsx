import React from 'react';
import styles from './DirectLinks.module.scss';
import { LINKS } from './DirectLinks.constants';
import Heading from 'components/Heading/Heading';
import { ReactComponent as ExternalLinkIcon } from 'assets/icons/External-Link.svg';
import { entries } from 'helpers/App';
import { usePhoneScreen } from 'hooks/media.hook';
import Linkd from 'components/Button/Button';

export default function DirectLinks() {
  const isPhoneScreen = usePhoneScreen();
  return (
    <div className={styles.DirectLinks}>
      <Heading size="large">Bezoek ook</Heading>
      <ul className={styles.LinkList}>
        {entries(LINKS)
          .filter(([, { isPhoneScreenLink }]) =>
            !isPhoneScreen ? isPhoneScreenLink !== true : true
          )
          .map(link => {
            const [linkName, { url, title, isExternalLink, id }] = link;
            return (
              <li key={linkName}>
                <Linkd
                  icon={isExternalLink ? ExternalLinkIcon : ''}
                  id={id}
                  href={url}
                  external={isExternalLink}
                >
                  {title}
                </Linkd>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
