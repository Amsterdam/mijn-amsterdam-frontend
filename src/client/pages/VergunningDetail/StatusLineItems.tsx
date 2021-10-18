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
    ];
    if (vergunning.caseType !== CaseType.EvenementVergunning) {
      lineItems.push({
        id: 'item-2',
        status: 'In behandeling',
        datePublished: dateWorkflowActive,
        description: '',
        documents: [],
        isActive: !isDone,
        isChecked: true,
      });
    }
    lineItems.push({
      id:
        vergunning.title === CaseType.EvenementVergunning ? 'item-2' : 'item-3',
      status: 'Afgehandeld',
      datePublished: vergunning.dateDecision || '',
      description: '',
      documents: [],
      isActive: isDone,
      isChecked: isDone,
    });

    return lineItems;
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
