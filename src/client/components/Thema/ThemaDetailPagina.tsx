import { ReactNode } from 'react';

import { LinkProps, ZaakDetail } from '../../../universal/types/App.types';
import { getRedactedClass } from '../../helpers/cobrowse';
import ErrorAlert from '../Alert/Alert';
import LoadingContent, { BarConfig } from '../LoadingContent/LoadingContent';
import { DetailPageV2, PageContentCell, PageContentV2 } from '../Page/Page';
import { PageHeadingV2 } from '../PageHeading/PageHeadingV2';
import { Steps } from '../StatusSteps/StatusSteps';

const LOADING_BAR_CONFIG_DEFAULT: BarConfig = [
  ['30rem', '4rem', '2rem'],
  ['30rem', '4rem', '2rem'],
  ['30rem', '4rem', '2rem'],
];

const ERROR_ALERT_DEFAULT = 'We kunnen op dit moment geen gegevens tonen.';

interface ThemaDetailPaginaProps<T> {
  themaId: string;
  zaak?: T | null;
  breadcrumbs?: LinkProps[];
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
  showStatusSteps?: boolean;
}

export default function ThemaDetailPagina<T extends Partial<ZaakDetail>>({
  themaId,
  zaak,
  title = 'Detailpagina',
  breadcrumbs,
  pageContentMain,
  pageContentBottom,
  errorAlertContent = ERROR_ALERT_DEFAULT,
  loadingBarConfig = LOADING_BAR_CONFIG_DEFAULT,
  isError,
  isLoading,
  reverseSteps = false,
  statusLabel = 'Status',
  showStatusSteps = true,
}: ThemaDetailPaginaProps<T>) {
  let statusItemSteps = zaak?.steps ?? [];

  if (reverseSteps && statusItemSteps.length) {
    statusItemSteps = [...statusItemSteps];
    statusItemSteps.reverse();
  }
  return (
    <DetailPageV2>
      <PageContentV2 className={getRedactedClass(themaId)}>
        <PageHeadingV2 breadcrumbs={breadcrumbs}>{title}</PageHeadingV2>

        {!isLoading && (isError || !zaak) && (
          <PageContentCell>
            <ErrorAlert
              title={isError ? 'Foutmelding' : 'Geen gegevens gevonden'}
              severity={isError ? 'error' : 'info'}
            >
              {errorAlertContent}
            </ErrorAlert>
          </PageContentCell>
        )}

        {isLoading && (
          <PageContentCell>
            <LoadingContent barConfig={loadingBarConfig} />
          </PageContentCell>
        )}

        {pageContentMain}

        {showStatusSteps && zaak && !!statusItemSteps.length && (
          <PageContentCell startWide={1} spanWide={12}>
            <Steps title={statusLabel} steps={statusItemSteps} />
          </PageContentCell>
        )}
        {pageContentBottom}
      </PageContentV2>
    </DetailPageV2>
  );
}
