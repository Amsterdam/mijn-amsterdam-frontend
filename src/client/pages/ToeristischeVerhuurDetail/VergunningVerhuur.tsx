import { useMemo } from 'react';
import {
  ToeristischeVerhuurBBVergunning,
  ToeristischeVerhuurVergunningaanvraag,
} from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import { PageContent } from '../../components';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import StatusLine, {
  StatusLineItem,
} from '../../components/StatusLine/StatusLine';
import styles from './ToeristischeVerhuurDetail.module.scss';
import { DocumentDetails } from '../VergunningDetail/DocumentDetails';

function getStatusBB(decision: string) {
  if (decision.includes('Verleend')) {
    return 'Verleend';
  }
  if (decision.includes('Geweigerd')) {
    return 'Geweigerd';
  }
  if (decision.includes('Ingetrokken')) {
    return 'Ingetrokken';
  }
  return '';
}

function useStatusLineItems(
  vergunning?:
    | ToeristischeVerhuurVergunningaanvraag
    | ToeristischeVerhuurBBVergunning
) {
  const statusLineItems: StatusLineItem[] = useMemo(() => {
    if (!vergunning) {
      return [];
    }
    const statusTrain = [
      {
        id: 'item-1',
        status: 'Ontvangen',
        datePublished: vergunning.dateRequest,
        description: '',
        documents: [],
        isActive: false,
        isChecked: true,
      },
      {
        id: 'item-2',
        status:
          vergunning.caseType === 'B&B - vergunning'
            ? 'In behandeling'
            : 'Verleend',
        datePublished: vergunning.dateRequest,
        description: '',
        documents: [],
        isActive: vergunning.status !== 'Afgehandeld',
        isChecked:
          vergunning.status === 'Afgehandeld' ||
          vergunning.status === 'Behandelen aanvraag',
      },
    ];
    if (vergunning.caseType === 'B&B - vergunning') {
      statusTrain.push({
        id: 'item-3',
        status: getStatusBB(vergunning.decision ?? ''),
        datePublished: vergunning?.dateDecision ?? '',
        description: '',
        documents: [],
        isActive: vergunning.status === 'Afgehandeld',
        isChecked: vergunning.status === 'Afgehandeld',
      });
    }

    if (
      vergunning.caseType === 'Vakantieverhuur vergunningsaanvraag' &&
      vergunning.decision?.toLowerCase().includes('ingetrokken')
    ) {
      statusTrain.push({
        id: 'item-3',
        status: 'Ingetrokken',
        datePublished: vergunning?.dateDecision ?? '',
        description: '',
        documents: [],
        isActive: vergunning.status === 'Afgehandeld',
        isChecked: vergunning.status === 'Afgehandeld',
      });
    }
    return statusTrain;
  }, [vergunning]);

  return statusLineItems;
}

export default function VergunningVerhuur({
  vergunning,
}: {
  vergunning:
    | ToeristischeVerhuurVergunningaanvraag
    | ToeristischeVerhuurBBVergunning;
}) {
  const statusLineItems = useStatusLineItems(vergunning);
  return (
    <>
      <PageContent className={styles.DetailPageContent}>
        <InfoDetail
          label="Gemeentelijk zaaknummer"
          value={vergunning?.identifier ?? '-'}
        />
        <InfoDetailGroup>
          <InfoDetail
            label="Vanaf"
            value={
              vergunning.dateStart
                ? defaultDateFormat(vergunning.dateStart)
                : '-'
            }
          />
          <InfoDetail
            label="Tot"
            value={
              vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
            }
          />
        </InfoDetailGroup>
        {vergunning.caseType === 'B&B - vergunning' && (
          <InfoDetailGroup>
            <InfoDetail
              label="Eigenaar woning"
              value={vergunning.owner ?? '-'}
            />
            <InfoDetail
              label="Aanvrager vergunning"
              value={vergunning.requester ?? '-'}
            />
          </InfoDetailGroup>
        )}
        <InfoDetail label="Adres" value={vergunning?.location ?? '-'} />
        <DocumentDetails vergunning={vergunning} />
      </PageContent>
      {!!statusLineItems.length && (
        <StatusLine
          className={styles.VergunningStatus}
          trackCategory="Toeristisch verhuur detail / status"
          items={statusLineItems}
          showToggleMore={false}
          id={`toeristische-verhuur-detail-${vergunning.id}`}
        />
      )}
    </>
  );
}
