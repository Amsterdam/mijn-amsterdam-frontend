import { generatePath, useParams } from 'react-router-dom';

import ExploitatieHorecabedrijf from './ExploitatieHorecabedrijf';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { showDocuments } from '../../../universal/helpers/vergunningen';
import { CaseType } from '../../../universal/types/vergunningen';
import { ErrorAlert, LoadingContent } from '../../components';
import {
  DetailPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { DocumentDetails } from '../VergunningDetail/DocumentDetails';
import { StatusLineItems } from '../VergunningDetail/StatusLineItems';

export default function HorecaDetail() {
  const { HORECA } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const Vergunning = HORECA.content?.find((item) => item.id === id);

  const isLoadingContent = isLoading(HORECA);
  const noContent = !isLoadingContent && !Vergunning;

  return (
    <DetailPageV2>
      <PageContentV2>
        <PageHeadingV2 backLink={generatePath(AppRoutes.HORECA)}>
          {Vergunning?.title || 'Horecavergunning'}
        </PageHeadingV2>
        <PageContentCell>
          {(isError(HORECA) || noContent) && (
            <ErrorAlert>
              We kunnen op dit moment geen gegevens tonen.
            </ErrorAlert>
          )}
          {isLoadingContent && <LoadingContent className="" />}
          {!isLoadingContent && Vergunning && (
            <>
              {Vergunning.caseType === CaseType.ExploitatieHorecabedrijf && (
                <ExploitatieHorecabedrijf vergunning={Vergunning} />
              )}

              {showDocuments(Vergunning.caseType) &&
                !!Vergunning.documentsUrl && (
                  <DocumentDetails vergunning={Vergunning} />
                )}
            </>
          )}
        </PageContentCell>

        {!isLoadingContent && Vergunning && (
          <PageContentCell>
            <StatusLineItems
              vergunning={Vergunning}
              trackPath={(document) =>
                `/downloads/vergunningen/${Vergunning.caseType.toLocaleLowerCase()}/${
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
