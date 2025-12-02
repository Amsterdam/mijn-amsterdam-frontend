import { ReactNode } from 'react';

import { Breadcrumb, Heading, Icon } from '@amsterdam/design-system-react';
import { ChevronBackwardIcon } from '@amsterdam/design-system-react-icons';
import { useLocation, useNavigate } from 'react-router';

import styles from './PageHeadingV2.module.scss';
import { LinkProps } from '../../../universal/types/App.types';
import { dashboardMenuItem } from '../../pages/Dashboard/Dashboard-routes';
import { MaBreadcrumbLink, MaRouterLink } from '../MaLink/MaLink';
import { PageContentCell } from '../Page/Page';

export type PageHeadingProps = {
  children: ReactNode;
  breadcrumbs?: LinkProps[];
  showBacklink?: boolean;
  className?: string;
  label?: string;
};

export function PageHeadingV2({
  children,
  breadcrumbs = [],
  showBacklink = false,
  label = 'Terug',
}: PageHeadingProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <PageContentCell
      startWide={1}
      spanWide={12}
      className={styles.PageHeadingWrap}
    >
      <div className={styles.PageHeadingInner} id="skip-to-id-AppContent">
        {showBacklink ? (
          <MaRouterLink
            className={styles.BackLink}
            maVariant="noDefaultUnderline"
            onClick={(event) => {
              event.preventDefault();
              navigate(-1);
              return;
            }}
            title="Terug naar de vorige pagina"
          >
            <Icon size="heading-5" svg={ChevronBackwardIcon} />
            {label}
          </MaRouterLink>
        ) : (
          <Breadcrumb>
            <MaBreadcrumbLink href={dashboardMenuItem.to}>
              {dashboardMenuItem.title}
            </MaBreadcrumbLink>
            {breadcrumbs.filter(Boolean).map(({ to, title }) => (
              <MaBreadcrumbLink key={to} href={to}>
                {title}
              </MaBreadcrumbLink>
            ))}
            <MaBreadcrumbLink tabIndex={-1} href={location.pathname}>
              <span className="ams-visually-hidden">{children}</span>
            </MaBreadcrumbLink>
          </Breadcrumb>
        )}

        <Heading className={styles.PageHeading} level={1} size="level-1">
          {children}
        </Heading>
      </div>
    </PageContentCell>
  );
}
