import { ReactNode } from 'react';

import { ZaakDetail } from '../../../universal/types/App.types';
import ErrorAlert from '../../components/Alert/Alert';
import LoadingContent, {
  BarConfig,
} from '../../components/LoadingContent/LoadingContent';
import {
  DetailPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { Steps } from '../../components/StatusLine/StatusLineV2';

const LOADING_BAR_CONFIG_DEFAULT: BarConfig = [
  ['30rem', '4rem', '2rem'],
  ['30rem', '4rem', '2rem'],
  ['30rem', '4rem', '2rem'],
];

const ERROR_ALERT_DEFAULT = 'We kunnen op dit moment geen gegevens tonen.';

interface ThemaDetailPaginaProps<T> {
  zaak?: T | null;
  backLink: string;
  errorAlertContent?: ReactNode;
  isError: boolean;
  isLoading: boolean;
  loadingBarConfig?: BarConfig;
  pageContentMain: ReactNode;
  pageContentBottom?: ReactNode;
  reverseSteps?: boolean;
  statusLabel?: string;
  title?: string;
  className?: string;
}

export default function ThemaDetailPagina<T extends ZaakDetail>({
  zaak,
  title = 'Detailpagina',
  backLink,
  pageContentMain,
  pageContentBottom,
  errorAlertContent = ERROR_ALERT_DEFAULT,
  loadingBarConfig = LOADING_BAR_CONFIG_DEFAULT,
  isError,
  isLoading,
  reverseSteps = false,
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

        {pageContentMain}

        {!!statusItemSteps.length && zaak && (
          <PageContentCell startWide={1} spanWide={12}>
            <Steps title={statusLabel} steps={statusItemSteps} />
          </PageContentCell>
        )}
        {pageContentBottom}
      </PageContentV2>
    </DetailPageV2>
  );
}
