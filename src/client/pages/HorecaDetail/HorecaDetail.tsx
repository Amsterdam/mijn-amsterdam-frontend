import { generatePath, useParams } from 'react-router-dom';

import ExploitatieHorecabedrijf from './ExploitatieHorecabedrijf';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { showDocuments } from '../../../universal/helpers/vergunningen';
import { CaseType } from '../../../universal/types/vergunningen';
import {
  ErrorAlert,
  ThemaIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import { ThemaTitles } from '../../config/thema';
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
    <DetailPage>
      <PageHeading
        icon={<ThemaIcon />}
        backLink={{
          to: generatePath(AppRoutes.HORECA),
          title: ThemaTitles.HORECA,
        }}
        isLoading={isLoadingContent}
      >
        {Vergunning?.title || 'Horecavergunning'}
      </PageHeading>

      <PageContent className="">
        {(isError(HORECA) || noContent) && (
          <ErrorAlert>We kunnen op dit moment geen gegevens tonen.</ErrorAlert>
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
      </PageContent>
      {!isLoadingContent && Vergunning && (
        <StatusLineItems
          vergunning={Vergunning}
          trackPath={(document) =>
            `/downloads/vergunningen/${Vergunning.caseType.toLocaleLowerCase()}/${
              document.title
            }`
          }
        />
      )}
    </DetailPage>
  );
}
