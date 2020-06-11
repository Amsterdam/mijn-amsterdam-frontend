import React, { HTMLAttributes } from 'react';

import { ReactComponent as ExternalLinkIcon } from '../../assets/icons/External-Link.svg';
import Heading from '../Heading/Heading';
import { LINKS } from './DirectLinks.constants';
import Linkd from '../Button/Button';
import classnames from 'classnames';
import { entries } from '../../helpers/App';
import styles from './DirectLinks.module.scss';
import { usePhoneScreen } from '../../hooks/media.hook';

export default function DirectLinks({
  id = 'DirectLinks',
  className,
  ...otherProps
}: HTMLAttributes<HTMLDivElement>) {
  const isPhoneScreen = usePhoneScreen();
  return (
    <div
      {...otherProps}
      className={classnames(styles.DirectLinks, className)}
      id={id}
    >
      <Heading id={`${id}Header`} size="large">
        Bezoek ook
      </Heading>
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
