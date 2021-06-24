import { useMemo } from 'react';

import { ToeristischeVerhuur } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { PageContent } from '../../components';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import StatusLine, {
  StatusLineItem,
} from '../../components/StatusLine/StatusLine';
import styles from './ToeristischeVerhuurDetail.module.scss';
import { Location } from '../VergunningDetail/Location';

function useStatusLineItems(vergunning?: ToeristischeVerhuur) {
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
        status: 'Gemeld',
        datePublished: vergunning.dateRequest,
        description: '',
        documents: [],
        isActive: !vergunning.cancelled,
        isChecked: true,
      },
    ];
    if (vergunning.cancelled) {
      statusTrain.push({
        id: 'item-3',
        status: 'Geannuleerd',
        datePublished: vergunning.dateCancelled ?? vergunning.dateRequest,
        description: '',
        documents: [],
        isActive: true,
        isChecked: true,
      });
    }

    return statusTrain;
  }, [vergunning]);

  return statusLineItems;
}

export default function VakantieVerhuur({
  vergunning,
}: {
  vergunning: ToeristischeVerhuur;
}) {
  const statusLineItems = useStatusLineItems(vergunning);
  return (
    <>
      <PageContent className={styles.DetailPageContent}>
        <InfoDetail
          label="Gemeentelijk zaaknummer"
          value={vergunning.identifier ?? '-'}
        />
        <InfoDetail
          label="Ontvangen op"
          value={
            vergunning.dateRequest
              ? defaultDateFormat(vergunning.dateRequest)
              : '-'
          }
        />
        <InfoDetailGroup>
          <InfoDetail
            label="Datum start verhuur"
            value={
              vergunning.dateStart
                ? defaultDateFormat(vergunning.dateStart)
                : '-'
            }
          />
          <InfoDetail
            label="Datum einde verhuur"
            value={
              vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
            }
          />
        </InfoDetailGroup>
        <InfoDetail label="Aantal nachten" value={vergunning.duration} />
        <Location label="Adres" location={vergunning.location} />
      </PageContent>
      {!!statusLineItems.length && (
        <StatusLine
          className={styles.VergunningStatus}
          trackCategory={`Toeristisch verhuur detail / status`}
          items={statusLineItems}
          showToggleMore={false}
          id={`toeristische-verhuur-detail-${vergunning.id}`}
        />
      )}
    </>
  );
}
