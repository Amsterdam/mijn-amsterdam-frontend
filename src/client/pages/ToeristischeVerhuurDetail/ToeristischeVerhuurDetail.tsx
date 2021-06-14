import { useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { hasFailedDependency, isLoading } from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './ToeristischeVerhuurDetail.module.scss';
import VakantieVerhuur from './VakantieVerhuur';
import VergunningVerhuur from './VergunningVerhuur';

export default function ToeristischVerhuurDetail() {
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();
  const { content } = TOERISTISCHE_VERHUUR;
  const { id } = useParams<{ id: string }>();
  const Vergunning = content?.vergunningen?.find((item) => item.id === id);
  const noContent = !isLoading(TOERISTISCHE_VERHUUR) && !Vergunning;

  const hasWarning =
    hasFailedDependency(TOERISTISCHE_VERHUUR, 'vergunningen') || noContent;
  const isLoadingApi = isLoading(TOERISTISCHE_VERHUUR);

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
        {Vergunning?.title || 'Onbekende toeristische verhuur'}
      </PageHeading>
      {(isLoadingApi || hasWarning) && (
        <PageContent className={styles.DetailPageContent}>
          {hasWarning && (
            <Alert type="warning">
              <p>We kunnen op dit moment niet alle gegevens tonen.</p>
            </Alert>
          )}
          {isLoadingApi && (
            <LoadingContent className={styles.LoadingContentInfo} />
          )}
        </PageContent>
      )}
      {Vergunning?.caseType === 'Vakantieverhuur' && (
        <VakantieVerhuur vergunning={Vergunning} />
      )}
      {(Vergunning?.caseType === 'Vakantieverhuur vergunningsaanvraag' ||
        Vergunning?.caseType === 'B&B - vergunning') && (
        <VergunningVerhuur vergunning={Vergunning} />
      )}
    </DetailPage>
  );
}
