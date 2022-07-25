import { useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { showDocuments } from '../../../universal/helpers/vergunningen';
import { CaseType } from '../../../universal/types/vergunningen';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import { AanbiedenDiensten } from './AanbiedenDiensten';
import { BZB } from './BZB';
import { BZP } from './BZP';
import { DocumentDetails } from './DocumentDetails';
import { ERVV } from './ERVV';
import { EvenementMelding } from './EvenementMelding';
import { EvenementVergunning } from './EvenementVergunning';
import { Flyeren } from './Flyeren';
import { GPK } from './GPK';
import { GPP } from './GPP';
import { Nachtwerkontheffing } from './Nachtwerkontheffing';
import { Omzettingsvergunning } from './Omzettingsvergunning';
import { StatusLineItems } from './StatusLineItems';
import { TVMRVVObject } from './TVMRVVObject';
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
            {Vergunning.caseType === CaseType.TVMRVVObject && (
              <TVMRVVObject vergunning={Vergunning} />
            )}
            {Vergunning.caseType === CaseType.GPK && (
              <GPK vergunning={Vergunning} />
            )}
            {Vergunning.caseType === CaseType.GPP && (
              <GPP vergunning={Vergunning} />
            )}
            {Vergunning.caseType === CaseType.ERVV && (
              <ERVV vergunning={Vergunning} />
            )}
            {Vergunning.caseType === CaseType.Omzettingsvergunning && (
              <Omzettingsvergunning vergunning={Vergunning} />
            )}
            {Vergunning.caseType === CaseType.EvenementVergunning && (
              <EvenementVergunning vergunning={Vergunning} />
            )}
            {Vergunning.caseType === CaseType.EvenementMelding && (
              <EvenementMelding vergunning={Vergunning} />
            )}
            {Vergunning.caseType === CaseType.BZP && (
              <BZP vergunning={Vergunning} />
            )}
            {Vergunning.caseType === CaseType.BZB && (
              <BZB vergunning={Vergunning} />
            )}
            {Vergunning.caseType === CaseType.Flyeren && (
              <Flyeren vergunning={Vergunning} />
            )}
            {Vergunning.caseType === CaseType.AanbiedenDiensten && (
              <AanbiedenDiensten vergunning={Vergunning} />
            )}
            {Vergunning.caseType === CaseType.NachtwerkOntheffing && (
              <Nachtwerkontheffing vergunning={Vergunning} />
            )}

            {showDocuments(Vergunning?.caseType) &&
              !!Vergunning?.documentsUrl && (
                <DocumentDetails vergunning={Vergunning} />
              )}
          </>
        )}
      </PageContent>
      {!isLoading(VERGUNNINGEN) && Vergunning && (
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
