import { generatePath, useParams } from 'react-router-dom';

import ExploitatieHorecabedrijf from './ExploitatieHorecabedrijf';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { CaseTypeV2 } from '../../../universal/types/decos-zaken';
import { ErrorAlert, LoadingContent } from '../../components';
import {
  DetailPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { DocumentDetails } from '../VergunningenV2/detail-page-content/DocumentDetails';
import { StatusLineItems } from '../VergunningenV2/detail-page-content/StatusLineItems';

export default function HorecaDetail() {
  const { HORECA } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const vergunning = HORECA.content?.find((item) => item.id === id);

  const isLoadingContent = isLoading(HORECA);
  const noContent = !isLoadingContent && !vergunning;

  return (
    <DetailPageV2>
      <PageContentV2>
        <PageHeadingV2 backLink={generatePath(AppRoutes.HORECA)}>
          {vergunning?.title || 'Horecavergunning'}
        </PageHeadingV2>
        <PageContentCell>
          {(isError(HORECA) || noContent) && (
            <ErrorAlert>
              We kunnen op dit moment geen gegevens tonen.
            </ErrorAlert>
          )}
          {isLoadingContent && <LoadingContent className="" />}
          {!isLoadingContent && vergunning && (
            <>
              {vergunning.caseType === CaseTypeV2.ExploitatieHorecabedrijf && (
                <ExploitatieHorecabedrijf vergunning={vergunning} />
              )}

              {!!vergunning.fetchDocumentsUrl && (
                <DocumentDetails vergunning={vergunning} />
              )}
            </>
          )}
        </PageContentCell>

        {!isLoadingContent && vergunning && (
          <PageContentCell>
            <StatusLineItems
              vergunning={vergunning}
              trackPath={(document) =>
                `/downloads/vergunningen/${vergunning.caseType.toLocaleLowerCase()}/${
                  document.title
                }`
              }
            />
          </PageContentCell>
        )}
      </PageContentV2>
    </DetailPageV2>
  );
}
