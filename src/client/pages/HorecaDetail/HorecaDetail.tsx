import { useParams } from 'react-router-dom';
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

export default function HorecaDetail() {
  const { HORECA } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const Vergunning = HORECA.content?.find((item) => item.id === id);
  const noContent = !isLoading(HORECA) && !Vergunning;

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{
          to: AppRoutes.HORECA,
          title: ChapterTitles.HORECA,
        }}
        isLoading={isLoading(HORECA)}
      >
        {Vergunning?.title || 'Vergunning'}
      </PageHeading>

      <PageContent className="">
        {(isError(HORECA) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading(HORECA) && <LoadingContent className="" />}
        {!isLoading(HORECA) && Vergunning && (
          <>
            {Vergunning.caseType === CaseType.ExploitatieHorecabedrijf && (
              <ExploitatieHorecabedrijf vergunning={Vergunning} />
            )}
          </>
        )}
      </PageContent>
      {!isLoading(HORECA) && Vergunning && (
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
