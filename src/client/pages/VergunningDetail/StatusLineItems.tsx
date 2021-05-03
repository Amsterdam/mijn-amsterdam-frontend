import { useMemo } from 'react';
import { Vergunning } from '../../../server/services/vergunningen';
import StatusLine, {
  StatusLineItem,
} from '../../components/StatusLine/StatusLine';
import styles from './VergunningDetail.module.scss';

function useVergunningStatusLineItems(vergunning?: Vergunning) {
  const statusLineItems: StatusLineItem[] = useMemo(() => {
    if (!vergunning) {
      return [];
    }

    const isDone = vergunning.status === 'Afgehandeld';
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
        status: 'In behandeling',
        datePublished: vergunning.dateRequest,
        description: '',
        documents: [],
        isActive: !isDone,
        isChecked: true,
      },
      {
        id: 'item-3',
        status: 'Afgehandeld',
        datePublished: vergunning.dateDecision || '',
        description: '',
        documents: [],
        isActive: isDone,
        isChecked: isDone,
      },
    ];
  }, [vergunning]);

  return statusLineItems;
}

export function StatusLineItems({ vergunning }: { vergunning: Vergunning }) {
  const statusLineItems = useVergunningStatusLineItems(vergunning);

  if (!statusLineItems.length) {
    return null;
  }
  return (
    <StatusLine
      className={styles.VergunningStatus}
      trackCategory={`Vergunningen detail / status`}
      items={statusLineItems}
      showToggleMore={false}
      id={`vergunning-detail-${vergunning.id}`}
    />
  );
}
