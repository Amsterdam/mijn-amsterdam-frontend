import { HTMLAttributes } from 'react';

import { Heading } from '@amsterdam/design-system-react';
import classnames from 'classnames';

import { LINKS } from './DirectLinks.constants';
import styles from './DirectLinks.module.scss';
import { entries } from '../../../universal/helpers/utils';
import { IconExternalLink } from '../../assets/icons';
import { ButtonBody } from '../Button/Button';
import { MaLink } from '../MaLink/MaLink';

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
                <MaLink
                  id={id}
                  href={url}
                  isExternal={isExternalLink}
                  variant={'inline'}
                >
                  {isExternalLink ? (
                    <ButtonBody iconPosition="left" icon={IconExternalLink}>
                      {title}
                    </ButtonBody>
                  ) : (
                    title
                  )}
                </MaLink>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
