import { MouseEventHandler, useCallback } from 'react';

import { Heading, Icon } from '@amsterdam/design-system-react';
import { ChevronLeftIcon } from '@amsterdam/design-system-react-icons';
import { useHistory } from 'react-router-dom';

import styles from './PageHeadingV2.module.scss';
import { ComponentChildren } from '../../../universal/types';
import { MaRouterLink } from '../MaLink/MaLink';
import { PageContentCell } from '../Page/Page';

export type PageHeadingProps = {
  children: ComponentChildren;
  backLink?: string;
  showBacklink?: boolean;
  className?: string;
  label?: string;
};

export function PageHeadingV2({
  children,
  backLink,
  showBacklink = true,
  label = 'Terug',
}: PageHeadingProps) {
  const history = useHistory();
  const goBack: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      event.preventDefault();
      history.goBack();
    },
    [history]
  );
  return (
    <PageContentCell
      startWide={1}
      spanWide={7}
      className={styles.PageHeadingWrap}
    >
      <div className={styles.PageHeadingSizer}>
        <div className={styles.PageHeadingInner}>
          {showBacklink && (
            <MaRouterLink
              className={styles.BackLink}
              maVariant="noDefaultUnderline"
              href={backLink || '/'}
              onClick={!backLink ? goBack : undefined}
            >
              <Icon size="level-5" svg={ChevronLeftIcon} />
              {label}
            </MaRouterLink>
          )}
          <Heading className={styles.PageHeading} level={3}>
            {children}
          </Heading>
        </div>
      </div>
    </PageContentCell>
  );
}
