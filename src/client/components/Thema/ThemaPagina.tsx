import { ReactNode } from 'react';

import { LinkList } from '@amsterdam/design-system-react';

import styles from './ThemaPagina.module.scss';
import { LinkProps } from '../../../universal/types/App.types';
import ErrorAlert from '../Alert/Alert';
import LoadingContent, { BarConfig } from '../LoadingContent/LoadingContent';
import { MaintenanceNotifications } from '../MaintenanceNotifications/MaintenanceNotifications';
import { PageContentCell, PageV2 } from '../Page/Page';

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
  linkListItems: LinkProps[];
  pageContentBottom?: ReactNode;
  errorAlertContent?: ReactNode;
  loadingBarConfig?: BarConfig;
  isError: boolean;
  isPartialError?: boolean;
  isLoading: boolean;
  maintenanceNotificationsPageSlug?: string;
  themaFeedbackDetails?: object;
}
export default function ThemaPagina({
  id,
  title,
  breadcrumbs,
  pageContentTop,
  pageContentTopSecondary,
  linkListItems = [],
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
  const showError = (!isError && isPartialError) || isError;
  const themaFeedbackDetails_ = {
    id,
    title,
    details: themaFeedbackDetails || {},
  };
  const userFeedbackDetails = Object.entries(themaFeedbackDetails_).reduce(
    (details, [key, value]) => {
      details[`thema_${key}`] = value;
      return details;
    },
    {} as Record<string, unknown>
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
      {!!linkListItems.length && (
        <PageContentCell className={styles.PullUp}>
          <LinkList>
            {linkListItems.map(({ to, title }) => (
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
