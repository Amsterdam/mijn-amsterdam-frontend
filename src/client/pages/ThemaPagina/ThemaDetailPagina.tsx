import { ReactNode } from 'react';

import { Grid } from '@amsterdam/design-system-react';

import {
  GenericDocument,
  ZaakDetail,
} from '../../../universal/types/App.types';
import {
  ErrorAlert,
  LoadingContent,
  StatusLine as StatusLineComponent,
} from '../../components';
import { BarConfig } from '../../components/LoadingContent/LoadingContent';
import {
  DetailPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';

const LOADING_BAR_CONFIG_DEFAULT: BarConfig = [
  ['30rem', '4rem', '2rem'],
  ['30rem', '4rem', '2rem'],
  ['30rem', '4rem', '2rem'],
];

const ERROR_ALERT_DEFAULT = 'We kunnen op dit moment geen gegevens tonen.';

interface ThemaDetailPaginaProps<T> {
  zaak?: T | null;
  backLink: string;
  documentPathForTracking?: (document: GenericDocument) => string;
  errorAlertContent?: ReactNode;
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
    <DetailPageV2>
      <PageContentV2>
        <PageHeadingV2 backLink={backLink}>{title}</PageHeadingV2>

        {pageContentTop}

        {!isLoading && (isError || !zaak) && (
          <PageContentCell>
            <ErrorAlert>{errorAlertContent}</ErrorAlert>
          </PageContentCell>
        )}

        {isLoading && (
          <PageContentCell>
            <LoadingContent barConfig={loadingBarConfig} />
          </PageContentCell>
        )}
      </PageContentV2>
      <Grid>
        {!!statusItemSteps.length && zaak && (
          <PageContentCell>
            <StatusLineComponent
              statusLabel={statusLabel}
              showStatusLineConnection={showStatusLineConnection}
              items={statusItemSteps}
              documentPathForTracking={documentPathForTracking}
            />
          </PageContentCell>
        )}
      </Grid>
      {!!pageContentBottom && (
        <PageContentV2>{pageContentBottom}</PageContentV2>
      )}
    </DetailPageV2>
  );
}
