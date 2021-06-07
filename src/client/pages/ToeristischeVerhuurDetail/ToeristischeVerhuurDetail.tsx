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
import styles from './ToeristischeVerhuurDetail.module.scss';
import VakantieVerhuur from './VakantieVerhuur';
import VergunningVerhuur from './VergunningVerhuur';

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
        {Vergunning?.title || 'Onbekende toeristische verhuur'}
      </PageHeading>
      {isError(TOERISTISCHE_VERHUUR) ||
      noContent ||
      isLoading(TOERISTISCHE_VERHUUR) ? (
        <PageContent className={styles.DetailPageContent}>
          {(isError(TOERISTISCHE_VERHUUR) || noContent) && (
            <Alert type="warning">
              <p>We kunnen op dit moment geen gegevens tonen.</p>
            </Alert>
          )}
          {isLoading(TOERISTISCHE_VERHUUR) && (
            <LoadingContent className={styles.LoadingContentInfo} />
          )}
        </PageContent>
      ) : (
        <>
          {(Vergunning?.caseType === 'Vakantieverhuur' ||
            Vergunning?.caseType === 'Vakantieverhuur afmelding') && (
            <VakantieVerhuur vergunning={Vergunning} />
          )}
          {(Vergunning?.caseType === 'Vakantieverhuur vergunningsaanvraag' ||
            Vergunning?.caseType === 'B&B - vergunning') && (
            <VergunningVerhuur vergunning={Vergunning} />
          )}
        </>
      )}
    </DetailPage>
  );
}
