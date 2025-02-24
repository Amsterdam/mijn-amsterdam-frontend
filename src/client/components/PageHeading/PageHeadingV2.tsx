import { MouseEventHandler, ReactNode, useCallback } from 'react';

import { Heading, Icon } from '@amsterdam/design-system-react';
import { ChevronLeftIcon } from '@amsterdam/design-system-react-icons';
import { useHistory } from 'react-router-dom';

import styles from './PageHeadingV2.module.scss';
import { MaRouterLink } from '../MaLink/MaLink';
import { PageContentCell } from '../Page/Page';

export type PageHeadingProps = {
  children: ReactNode;
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
      return;
    },
    [history]
  );

  return (
    <PageContentCell
      startWide={1}
      spanWide={7}
      className={styles.PageHeadingWrap}
    >
      <div className={styles.PageHeadingInner} id="skip-to-id-AppContent">
        {showBacklink && (
          <MaRouterLink
            className={styles.BackLink}
            maVariant="noDefaultUnderline"
            href={backLink || '/'}
            onClick={goBack}
            title="Terug naar de vorige pagina"
          >
            <Icon size="level-5" svg={ChevronLeftIcon} />
            {label}
          </MaRouterLink>
        )}
        <Heading className={styles.PageHeading} level={3} size="level-1">
          {children}
        </Heading>
      </div>
    </PageContentCell>
  );
}
