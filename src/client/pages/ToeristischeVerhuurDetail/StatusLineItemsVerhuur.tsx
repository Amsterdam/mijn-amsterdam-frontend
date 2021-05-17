import { useMemo } from 'react';
import { Vergunning } from '../../../server/services/vergunningen';
import StatusLine, {
  StatusLineItem,
} from '../../components/StatusLine/StatusLine';
import styles from './ToeristischeVerhuurDetail.module.scss';

function useVergunningStatusLineItems(vergunning?: Vergunning) {
  const statusLineItems: StatusLineItem[] = useMemo(() => {
    if (!vergunning) {
      return [];
    }

    const isDone = vergunning.status === 'Verleend';
    return [
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
        status: 'Verleend',
        datePublished: vergunning.dateRequest,
        description: '',
        documents: [],
        isActive: isDone,
        isChecked: isDone,
      },
    ];
  }, [vergunning]);

  return statusLineItems;
}

export default function StatusLineItems({
  vergunning,
}: {
  vergunning: Vergunning;
}) {
  const statusLineItems = useVergunningStatusLineItems(vergunning);

  if (!statusLineItems.length) {
    return null;
  }
  return (
    <StatusLine
      className={styles.VergunningStatus}
      trackCategory={`Verhuur detail / status`}
      items={statusLineItems}
      showToggleMore={false}
      id={`verhuur-detail-${vergunning.id}`}
    />
  );
}
