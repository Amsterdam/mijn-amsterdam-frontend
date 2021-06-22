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
import { DocumentDetails } from '../VergunningDetail/DocumentDetails';
import styles from './ToeristischeVerhuurDetail.module.scss';

function useStatusLineItems(
  vergunning?:
    | ToeristischeVerhuurVergunningaanvraag
    | ToeristischeVerhuurBBVergunning
) {
  const statusLineItems: StatusLineItem[] = useMemo(() => {
    if (!vergunning) {
      return [];
    }
    /**
     * Steps for B&B:
     * - Ontvangen
     * - In behandeling
     * - Verleend/Geweigerd/Ingetrokken
     *
     * Steps for Vakantieverhuurvergunning:
     * - Ontvangen
     * - Verleend
     * (- Ingetrokken) optional
     */
    const lineItems = [
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
        datePublished:
          vergunning.status === 'Afgehandeld' ||
          vergunning.status === 'In behandeling'
            ? vergunning.dateRequest
            : '',
        description: '',
        documents: [],
        isActive:
          vergunning.caseType === 'B&B - vergunning'
            ? vergunning.status === 'In behandeling'
            : vergunning.decision !== 'Ingetrokken',
        isChecked:
          vergunning.decision === 'Verleend' ||
          vergunning.status === 'Afgehandeld' ||
          vergunning.status === 'In behandeling',
      },
    ];

    if (vergunning.caseType === 'B&B - vergunning') {
      lineItems.push({
        id: 'item-3',
        status:
          vergunning.status === 'Afgehandeld'
            ? vergunning.decision || ''
            : 'Afgehandeld',
        datePublished: vergunning?.dateDecision || '',
        description: '',
        documents: [],
        isActive: vergunning.status === 'Afgehandeld',
        isChecked: vergunning.status === 'Afgehandeld',
      });
    }

    if (
      vergunning.caseType === 'Vakantieverhuur vergunningsaanvraag' &&
      vergunning.decision === 'Ingetrokken'
    ) {
      lineItems.push({
        id: 'item-3',
        status: 'Ingetrokken',
        datePublished: vergunning?.dateDecision ?? '',
        description: '',
        documents: [],
        isActive: true,
        isChecked: true,
      });
    }
    return lineItems;
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
