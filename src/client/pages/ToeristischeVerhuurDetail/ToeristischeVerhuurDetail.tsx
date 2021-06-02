import { useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import { DocumentDetails } from '../VergunningDetail/DocumentDetails';
import styles from './ToeristischeVerhuurDetail.module.scss';
import VakantieVerhuur from './VakantieVerhuur';
import VergunningVerhuur from './VergunningVerhuur';
import { StatusLineItems } from '../VergunningDetail/StatusLineItems';
import { ToeristischeVerhuurVergunningen } from '../../../server/services/toeristische-verhuur';

function getHeaderTitle(vergunning: ToeristischeVerhuurVergunningen): string {
  switch (vergunning.caseType) {
    case 'Vakantieverhuur':
      return `${!vergunning.isActual ? 'Afgelopen' : 'Geplande'} verhuur ${
        vergunning.dateStart
      }`;
    case 'Vakantieverhuur afmelding':
      return `Afgemeld verhuur ${vergunning.dateStart}`;
    case 'Vakantieverhuur vergunningsaanvraag':
      return `Vergunning tijdelijke vakantie verhuur`;
    case 'B&B - vergunning':
      return `Vergunning bed and breakfast`;
    default:
      return 'Onbekende Toeristische verhuur';
  }
}

export default function ToeristischVerhuurDetail() {
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();
  const { content } = TOERISTISCHE_VERHUUR;
  const { id } = useParams<{ id: string }>();
  const Vergunning = content?.vergunningen?.find((item) => item.id === id);
  const noContent = !isLoading(TOERISTISCHE_VERHUUR) && !Vergunning;
  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{
          to: AppRoutes.TOERISTISCHE_VERHUUR,
          title: ChapterTitles.TOERISTISCHE_VERHUUR,
        }}
        isLoading={isLoading(TOERISTISCHE_VERHUUR)}
      >
        {Vergunning
          ? getHeaderTitle(Vergunning)
          : ChapterTitles.TOERISTISCHE_VERHUUR}
      </PageHeading>

      <PageContent className={styles.DetailPageContent}>
        {(isError(TOERISTISCHE_VERHUUR) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading(TOERISTISCHE_VERHUUR) && (
          <LoadingContent className={styles.LoadingContentInfo} />
        )}
        {!isLoading(TOERISTISCHE_VERHUUR) && Vergunning && (
          <>
            {(Vergunning.caseType === 'Vakantieverhuur' ||
              Vergunning.caseType === 'Vakantieverhuur afmelding') && (
              <VakantieVerhuur vergunning={Vergunning} />
            )}
            {(Vergunning.caseType === 'Vakantieverhuur vergunningsaanvraag' ||
              Vergunning.caseType === 'B&B - vergunning') && (
              <VergunningVerhuur vergunning={Vergunning} />
            )}
            <DocumentDetails vergunning={Vergunning} />
          </>
        )}
      </PageContent>
      {!isLoading(TOERISTISCHE_VERHUUR) && Vergunning && (
        <StatusLineItems vergunning={Vergunning} />
      )}
    </DetailPage>
  );
}
