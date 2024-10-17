import { ReactElement, ReactNode } from 'react';

import { Grid, Screen } from '@amsterdam/design-system-react';

import {
  GenericDocument,
  LinkProps,
  ZaakDetail,
} from '../../../universal/types/App.types';
import {
  DetailPage,
  ErrorAlert,
  LoadingContent,
  PageHeading,
  StatusLine as StatusLineComponent,
  ThemaIcon,
} from '../../components';
import { BarConfig } from '../../components/LoadingContent/LoadingContent';

const LOADING_BAR_CONFIG_DEFAULT: BarConfig = [
  ['30rem', '4rem', '2rem'],
  ['30rem', '4rem', '2rem'],
  ['30rem', '4rem', '2rem'],
];

const ERROR_ALERT_DEFAULT = 'We kunnen op dit moment geen gegevens tonen.';

interface ThemaDetailPaginaProps<T> {
  zaak?: T | null;
  backLink: LinkProps;
  documentPathForTracking?: (document: GenericDocument) => string;
  errorAlertContent?: ReactNode;
  icon?: ReactElement;
  isError: boolean;
  isLoading: boolean;
  loadingBarConfig?: BarConfig;
  pageContentBottom?: ReactNode;
  pageContentTop: ReactNode;
  reverseSteps?: boolean;
  showStatusLineConnection?: boolean;
  statusLabel?: string;
  title?: string;
  className?: string;
}

export default function ThemaDetailPagina<T extends ZaakDetail>({
  zaak,
  title = 'Detailpagina',
  backLink,
  className,
  icon = <ThemaIcon />,
  pageContentTop,
  pageContentBottom,
  errorAlertContent = ERROR_ALERT_DEFAULT,
  loadingBarConfig = LOADING_BAR_CONFIG_DEFAULT,
  isError,
  isLoading,
  documentPathForTracking,
  reverseSteps = false,
  showStatusLineConnection = true,
  statusLabel = 'Status',
}: ThemaDetailPaginaProps<T>) {
  let statusItemSteps = zaak?.steps ?? [];

  if (reverseSteps && statusItemSteps.length) {
    statusItemSteps = [...statusItemSteps];
    statusItemSteps.reverse();
  }

  return (
    <DetailPage className={className}>
      <PageHeading icon={icon} backLink={backLink}>
        {title}
      </PageHeading>
      <Screen>
        <Grid>
          {pageContentTop}

          {!isLoading && (isError || !zaak) && (
            <Grid.Cell span="all">
              <ErrorAlert>{errorAlertContent}</ErrorAlert>
            </Grid.Cell>
          )}

          {isLoading && (
            <Grid.Cell span="all">
              <LoadingContent barConfig={loadingBarConfig} />
            </Grid.Cell>
          )}
        </Grid>
      </Screen>
      <Grid>
        {!!statusItemSteps.length && zaak && (
          <Grid.Cell span="all">
            <StatusLineComponent
              statusLabel={statusLabel}
              showStatusLineConnection={showStatusLineConnection}
              items={statusItemSteps}
              documentPathForTracking={documentPathForTracking}
            />
          </Grid.Cell>
        )}
      </Grid>
      {!!pageContentBottom && (
        <Screen>
          <Grid>{pageContentBottom}</Grid>
        </Screen>
      )}
    </DetailPage>
  );
}
