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
import styles from './ToeristischeVerhuurDetail.module.scss';
import VakantieVerhuur from './VakantieVerhuur';
import VergunningVerhuur from './VergunningVerhuur';
import StatusLineItemVerhuur from './StatusLineItemsVerhuur';
import { StatusLineItems } from '../VergunningDetail/StatusLineItems';

function getHeaderTitle(
  caseType: string,
  dateStart: string,
  isPast?: boolean
): string {
  switch (caseType) {
    case 'Vakantieverhuur':
      return `${isPast ? 'Afgelopen' : 'Geplande'} verhuur ${dateStart}`;
    case 'Vakantieverhuur afmelding':
      return `Afgemeld verhuur ${dateStart}`;
    case 'Vergunning tijdelijk vakantie verhuur':
      return `Afgemeld verhuur ${dateStart}`;
    default:
      return caseType;
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
        {getHeaderTitle(
          Vergunning?.caseType ?? '',
          Vergunning?.dateStart ?? '',
          Vergunning?.isPast
        )}
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
            {Vergunning.caseType === 'Vakantieverhuur vergunningaanvraag' && (
              <VergunningVerhuur vergunning={Vergunning} />
            )}
            <DocumentDetails vergunning={Vergunning} />
          </>
        )}
      </PageContent>
      {!isLoading(TOERISTISCHE_VERHUUR) &&
        Vergunning &&
        (Vergunning.caseType === 'Vakantieverhuur' ||
          Vergunning.caseType === 'Vakantieverhuur afmelding') && (
          <StatusLineItemVerhuur vergunning={Vergunning} />
        )}

      {!isLoading(TOERISTISCHE_VERHUUR) &&
        Vergunning &&
        Vergunning.caseType === 'Vakantieverhuur vergunningaanvraag' && (
          <StatusLineItems vergunning={Vergunning} />
        )}
    </DetailPage>
  );
}
