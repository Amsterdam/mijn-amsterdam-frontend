import { generatePath, useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { CaseType } from '../../../universal/types/vergunningen';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import { useAppStateGetter } from '../../hooks';
import { StatusLineItems } from '../VergunningDetail/StatusLineItems';
import ExploitatieHorecabedrijf from './ExploitatieHorecabedrijf';
import { showDocuments } from '../../../universal/helpers/vergunningen';
import { DocumentDetails } from '../VergunningDetail/DocumentDetails';

export default function HorecaDetail() {
  const { HORECA } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const Vergunning = HORECA.content?.find((item) => item.id === id);

  const isLoadingContent = isLoading(HORECA);
  const noContent = !isLoadingContent && !Vergunning;

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{
          to: generatePath(AppRoutes.HORECA),
          title: ChapterTitles.HORECA,
        }}
        isLoading={isLoadingContent}
      >
        {Vergunning?.title || 'Horecavergunning'}
      </PageHeading>

      <PageContent className="">
        {(isError(HORECA) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoadingContent && <LoadingContent className="" />}
        {!isLoadingContent && Vergunning && (
          <>
            {Vergunning.caseType === CaseType.ExploitatieHorecabedrijf && (
              <ExploitatieHorecabedrijf vergunning={Vergunning} />
            )}

            {showDocuments(Vergunning?.caseType) &&
              !!Vergunning?.documentsUrl && (
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
