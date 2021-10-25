import { useMemo } from 'react';
import { Vergunning } from '../../../server/services/vergunningen/vergunningen';
import { hasWorkflow } from '../../../universal/helpers/vergunningen';
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
    const hasDateWorkflowActive = !!vergunning.dateWorkflowActive;

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
        datePublished: vergunning.dateWorkflowActive || '',
        description: '',
        documents: [],
        isActive: hasWorkflow(vergunning.caseType)
          ? hasDateWorkflowActive && !isDone
          : !isDone,
        isChecked: hasDateWorkflowActive,
      });
    }
    lineItems.push({
      id: 'last-item',
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
