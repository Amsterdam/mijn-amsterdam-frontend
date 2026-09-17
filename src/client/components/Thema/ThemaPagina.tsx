import type { ReactNode } from 'react';

import { LinkList } from '@amsterdam/design-system-react';

import styles from './ThemaPagina.module.scss';
import type { LinkProps } from '../../../universal/types/App.types.ts';
import type { LinkConfig } from '../../config/thema-types.ts';
import { useProfileTypeValue } from '../../hooks/useProfileType.ts';
import { ErrorAlert } from '../Alert/Alert.tsx';
import {
  LoadingContent,
  type BarConfig,
} from '../LoadingContent/LoadingContent.tsx';
import { MaintenanceNotifications } from '../MaintenanceNotifications/MaintenanceNotifications.tsx';
import { PageContentCell, PageV2 } from '../Page/Page.tsx';

const LOADING_BAR_CONFIG_DEFAULT: BarConfig = [
  ['20rem', '4rem', '4rem'],
  ['40rem', '2rem', '4rem'],
  ['40rem', '2rem', '8rem'],
  ['30rem', '4rem', '4rem'],
  ['40rem', '2rem', '4rem'],
  ['40rem', '2rem', '4rem'],
];

const ERROR_ALERT_DEFAULT = 'We kunnen op dit moment niet alle gegevens tonen.';

interface ThemaPaginaProps {
  id: string;
  title: string;
  breadcrumbs?: LinkProps[];
  pageContentTop: ReactNode;
  pageContentTopSecondary?: ReactNode;
  pageContentMain: ReactNode;
  pageLinks: LinkConfig[];
  pageContentBottom?: ReactNode;
  errorAlertContent?: ReactNode;
  loadingBarConfig?: BarConfig;
  isError: boolean;
  isPartialError?: boolean;
  isLoading: boolean;
  maintenanceNotificationsPageSlug?: string;
  themaFeedbackDetails?: object;
}
export function ThemaPagina({
  id,
  title,
  breadcrumbs,
  pageContentTop,
  pageContentTopSecondary,
  pageLinks = [],
  pageContentMain,
  pageContentBottom,
  errorAlertContent,
  loadingBarConfig = LOADING_BAR_CONFIG_DEFAULT,
  isError,
  isPartialError,
  isLoading,
  maintenanceNotificationsPageSlug,
  themaFeedbackDetails,
}: ThemaPaginaProps) {
  const profileType = useProfileTypeValue();
  const showError = (!isError && isPartialError) || isError;
  const userFeedbackDetails = {
    pageTitle: title,
    pageDetails: themaFeedbackDetails || {},
  };
  const visiblePageLinks = pageLinks.filter(
    (pageLink) => pageLink.profileTypes?.includes(profileType) ?? true
  );

  return (
    <PageV2
      heading={title}
      breadcrumbs={breadcrumbs}
      redactedThemaId={id}
      showUserFeedback
      userFeedbackDetails={userFeedbackDetails}
    >
      {maintenanceNotificationsPageSlug && (
        <MaintenanceNotifications page={maintenanceNotificationsPageSlug} />
      )}
      {pageContentTop}
      {!!visiblePageLinks.length && (
        <PageContentCell className={pageContentTop ? styles.PullUp : ''}>
          <LinkList>
            {visiblePageLinks.map(({ to, title }) => (
              <LinkList.Link key={to} rel="noreferrer" href={to}>
                {title}
              </LinkList.Link>
            ))}
          </LinkList>
        </PageContentCell>
      )}
      {pageContentTopSecondary}
      {showError && (
        <PageContentCell>
          <ErrorAlert>
            {errorAlertContent || ERROR_ALERT_DEFAULT}
            {/* errorAlertContent could be an emty string, force to show an error. **/}
          </ErrorAlert>
        </PageContentCell>
      )}
      {isLoading && (
        <PageContentCell>
          <LoadingContent barConfig={loadingBarConfig} />
        </PageContentCell>
      )}
      {!isLoading && !isError && pageContentMain}
      {pageContentBottom}
    </PageV2>
  );
}
