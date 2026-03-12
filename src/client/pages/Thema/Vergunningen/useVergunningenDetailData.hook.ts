import { useParams } from 'react-router';

import { useVergunningDocumentList } from './detail-page-content/useVergunningDocumentsList.hook.ts';
import { themaConfig } from './Vergunningen-thema-config.ts';
import type { PowerBrowserZaakFrontend } from '../../../../server/services/powerbrowser/powerbrowser-types.ts';
import type { ZaakFrontendCombined } from '../../../../server/services/vergunningen/config-and-types.ts';
import { pbZaakTransformers } from '../../../../server/services/vergunningen/pb-zaken.ts';
import { FeatureToggle } from '../../../../universal/config/feature-toggles.ts';

function isPowerBrowserZaak(
  vergunning: ZaakFrontendCombined
): vergunning is PowerBrowserZaakFrontend {
  return (
    FeatureToggle.VTHOnPowerbrowserActive &&
    'title' in vergunning &&
    pbZaakTransformers.map((t) => t.title).includes(vergunning.title)
  );
}

export function useVergunningenDetailData<T extends ZaakFrontendCombined>(
  vergunningen: T[]
) {
  const { id } = useParams<{ id: ZaakFrontendCombined['id'] }>();
  const vergunning = vergunningen.find((vergunning) => vergunning.id === id);

  const isPBZaak = vergunning && isPowerBrowserZaak(vergunning);
  const fetchDocumentsUrl = isPBZaak
    ? undefined
    : vergunning?.fetchDocumentsUrl;

  const {
    documents,
    isLoading: isLoadingDocuments,
    isError: isErrorDocuments,
  } = useVergunningDocumentList(fetchDocumentsUrl);

  if (!isPBZaak && vergunning?.fetchSourceRaw) {
    // Utility url
    // eslint-disable-next-line no-console
    console.info(`Decos data: ${vergunning.fetchSourceRaw}`);
  }

  return {
    themaId: themaConfig.id,
    vergunning,
    isErrorDocuments,
    isLoadingDocuments,
    documents: isPBZaak ? vergunning.documents : documents,
    title: vergunning?.title,
    themaConfig,
  };
}
