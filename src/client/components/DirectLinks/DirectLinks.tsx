import { HTMLAttributes } from 'react';
import { Heading } from '@amsterdam/design-system-react';
import { IconExternalLink } from '../../assets/icons';
import { LINKS } from './DirectLinks.constants';
import Linkd from '../Button/Button';
import classnames from 'classnames';
import { entries } from '../../../universal/helpers';
import styles from './DirectLinks.module.scss';

export default function DirectLinks({
  id = 'DirectLinks',
  className,
  profileType,
  ...otherProps
}: HTMLAttributes<HTMLDivElement> & { profileType: ProfileType }) {
  return (
    <div
      {...otherProps}
      className={classnames(styles.DirectLinks, className)}
      id={id}
    >
      <Heading id={`${id}Header`} level={3} size="level-2">
        Bezoek ook
      </Heading>
      <ul className={styles.LinkList}>
        {entries(LINKS[profileType])
          .filter(([, { url, isActive }]) => !!url && isActive)
          .map((link) => {
            const [linkName, { url, title, isExternalLink, id }] = link;
            return (
              <li key={linkName}>
                <Linkd
                  icon={isExternalLink ? IconExternalLink : ''}
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
