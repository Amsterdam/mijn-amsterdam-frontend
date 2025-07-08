import { ReactNode } from 'react';

import { LinkProps, ZaakDetail } from '../../../universal/types/App.types.ts';
import ErrorAlert from '../Alert/Alert.tsx';
import LoadingContent, { BarConfig } from '../LoadingContent/LoadingContent.tsx';
import { DetailPageV2, PageContentCell, PageContentV2 } from '../Page/Page.tsx';
import { PageHeadingV2 } from '../PageHeading/PageHeadingV2.tsx';
import { Steps } from '../StatusSteps/StatusSteps.tsx';

const LOADING_BAR_CONFIG_DEFAULT: BarConfig = [
  ['30rem', '4rem', '2rem'],
  ['30rem', '4rem', '2rem'],
  ['30rem', '4rem', '2rem'],
];

const ERROR_ALERT_DEFAULT = 'We kunnen op dit moment geen gegevens tonen.';

interface ThemaDetailPaginaProps<T> {
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
      <PageContentV2>
        <PageHeadingV2 breadcrumbs={breadcrumbs}>{title}</PageHeadingV2>

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
