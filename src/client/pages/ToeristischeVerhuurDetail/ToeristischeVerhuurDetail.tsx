import { useParams } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { ThemaTitles } from '../../config/thema';
import { hasFailedDependency, isLoading } from '../../../universal/helpers';
import {
  ErrorAlert,
  ThemaIcon,
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

  const vergunning =
    content?.vakantieverhuurVergunningen?.find((item) => item.id === id) ||
    content?.bbVergunningen?.find((item) => item.id === id);

  const noContent = !isLoading(TOERISTISCHE_VERHUUR) && !vergunning;

  const hasWarning =
    hasFailedDependency(TOERISTISCHE_VERHUUR, 'vergunningen') || noContent;
  const isLoadingApi = isLoading(TOERISTISCHE_VERHUUR);

  return (
    <DetailPage>
      <PageHeading
        icon={<ThemaIcon />}
        backLink={{
          to: AppRoutes.TOERISTISCHE_VERHUUR,
          title: ThemaTitles.TOERISTISCHE_VERHUUR,
        }}
        isLoading={isLoading(TOERISTISCHE_VERHUUR)}
      >
        {vergunning?.titel || 'Onbekende vergunning'}
      </PageHeading>
      {(isLoadingApi || hasWarning) && (
        <PageContent className={styles.DetailPageContent}>
          {hasWarning && (
            <ErrorAlert>
              We kunnen op dit moment niet alle gegevens tonen.
            </ErrorAlert>
          )}
          {isLoadingApi && (
            <LoadingContent className={styles.LoadingContentInfo} />
          )}
        </PageContent>
      )}
      {vergunning?.titel.startsWith('Vergunning') && (
        <VergunningVerhuur vergunning={vergunning} />
      )}
    </DetailPage>
  );
}
