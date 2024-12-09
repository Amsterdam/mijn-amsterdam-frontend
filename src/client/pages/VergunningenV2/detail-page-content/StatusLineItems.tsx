import { useMemo } from 'react';

import { getEvenementVergunningLineItems } from './EvenementVergunning';
import { getRVVSloterwegLineItems } from './RvvSloterweg';
import styles from './VergunningDetail.module.scss';
import type { Vergunning } from '../../../../server/services/vergunningen/vergunningen';
import { hasWorkflow } from '../../../../universal/helpers/vergunningen';
import { GenericDocument, StatusLineItem } from '../../../../universal/types';
import { CaseType } from '../../../../universal/types/vergunningen';
import StatusLine from '../../../components/StatusLine/StatusLine';

function useVergunningStatusLineItems(vergunning?: Vergunning) {
  const statusLineItems: StatusLineItem[] = useMemo(() => {
    if (!vergunning) {
      return [];
    }

    switch (vergunning.caseType) {
      case CaseType.EvenementVergunning:
        return getEvenementVergunningLineItems(vergunning);
      case CaseType.RVVSloterweg:
        return getRVVSloterwegLineItems(vergunning);
    }

    const isDone = vergunning.processed;
    const hasDateWorkflowActive = !!vergunning.dateWorkflowActive;
    const inProgressActive = hasWorkflow(vergunning.caseType)
      ? hasDateWorkflowActive && !isDone
      : !isDone;

    const lineItems = [
      {
        id: 'item-1',
        status: 'Ontvangen',
        datePublished: vergunning.dateRequest,
        description: '',
        documents: [],
        isActive: !inProgressActive && !isDone,
        isChecked: true,
      },
      {
        id: 'item-2',
        status: 'In behandeling',
        datePublished: vergunning.dateWorkflowActive || '',
        description: '',
        documents: [],
        isActive: inProgressActive,
        isChecked: hasDateWorkflowActive || isDone,
      },
      {
        id: 'last-item',
        status: 'Afgehandeld',
        datePublished: vergunning.dateDecision || '',
        description: '',
        documents: [],
        isActive: isDone,
        isChecked: isDone,
      },
    ];

    return lineItems;
  }, [vergunning]);

  return statusLineItems;
}

export function StatusLineItems({
  vergunning,
  trackPath,
}: {
  vergunning: Vergunning;
  trackPath?: (document: GenericDocument) => string;
}) {
  const statusLineItems = useVergunningStatusLineItems(vergunning);

  if (!statusLineItems.length) {
    return null;
  }
  return (
    <StatusLine
      className={styles.VergunningStatus}
      trackCategory="Vergunningen detail / status"
      items={statusLineItems}
      id={`vergunning-detail-${vergunning.id}`}
      documentPathForTracking={trackPath}
    />
  );
}
