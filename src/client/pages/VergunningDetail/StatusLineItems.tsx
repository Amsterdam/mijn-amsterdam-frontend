import { useMemo } from 'react';
import type { Vergunning } from '../../../server/services/vergunningen';
import { CaseType } from '../../../universal/types/vergunningen';
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
    let dateWorkflowActive = vergunning.dateRequest || '';

    if (
      vergunning.caseType === CaseType.Omzettingsvergunning &&
      vergunning.dateWorkflowActive
    ) {
      dateWorkflowActive = vergunning.dateWorkflowActive;
    }

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
        datePublished: dateWorkflowActive,
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
