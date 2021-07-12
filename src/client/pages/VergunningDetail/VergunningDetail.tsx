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
import { DocumentDetails } from './DocumentDetails';
import { ERVV } from './ERVV';
import { EvenementMelding } from './EvenementMelding';
import { GPK } from './GPK';
import { GPP } from './GPP';
import { Omzettingsvergunning } from './Omzettingsvergunning';
import { StatusLineItems } from './StatusLineItems';
import { TVMRVVObject } from './TVMRVVObject';
import { BZP } from './BZP';
import { BZB } from './BZB';
import styles from './VergunningDetail.module.scss';

export default function VergunningDetail() {
  const { VERGUNNINGEN } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const Vergunning = VERGUNNINGEN.content?.find((item) => item.id === id);
  const noContent = !isLoading(VERGUNNINGEN) && !Vergunning;

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{
          to: AppRoutes.VERGUNNINGEN,
          title: ChapterTitles.VERGUNNINGEN,
        }}
        isLoading={isLoading(VERGUNNINGEN)}
      >
        {Vergunning?.title || 'Vergunning'}
      </PageHeading>

      <PageContent className={styles.DetailPageContent}>
        {(isError(VERGUNNINGEN) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading(VERGUNNINGEN) && (
          <LoadingContent className={styles.LoadingContentInfo} />
        )}
        {!isLoading(VERGUNNINGEN) && Vergunning && (
          <>
            {Vergunning.caseType === 'TVM - RVV - Object' && (
              <TVMRVVObject vergunning={Vergunning} />
            )}
            {Vergunning.caseType === 'GPK' && <GPK vergunning={Vergunning} />}
            {Vergunning.caseType === 'GPP' && <GPP vergunning={Vergunning} />}
            {Vergunning.caseType === 'E-RVV - TVM' && (
              <ERVV vergunning={Vergunning} />
            )}
            {Vergunning.caseType === 'Omzettingsvergunning' && (
              <Omzettingsvergunning vergunning={Vergunning} />
            )}
            {Vergunning.caseType === 'Evenement melding' && (
              <EvenementMelding vergunning={Vergunning} />
            )}
            {Vergunning.caseType ===
              'Parkeerontheffingen Blauwe zone particulieren' && (
              <BZP vergunning={Vergunning} />
            )}
            {Vergunning.caseType ===
              'Parkeerontheffingen Blauwe zone bedrijven' && (
              <BZB vergunning={Vergunning} />
            )}
            <DocumentDetails vergunning={Vergunning} />
          </>
        )}
      </PageContent>
      {!isLoading(VERGUNNINGEN) && Vergunning && (
        <StatusLineItems vergunning={Vergunning} />
      )}
    </DetailPage>
  );
}
