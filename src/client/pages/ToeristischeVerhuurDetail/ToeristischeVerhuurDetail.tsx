import { useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { hasFailedDependency, isLoading } from '../../../universal/helpers';
import { CaseType } from '../../../universal/types/vergunningen';
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
        {Vergunning?.title || 'Onbekende vergunning'}
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
      {(Vergunning?.title === 'Vergunning vakantieverhuur' ||
        Vergunning?.title === 'Vergunning bed & breakfast') && (
        <VergunningVerhuur vergunning={Vergunning} />
      )}
    </DetailPage>
  );
}
