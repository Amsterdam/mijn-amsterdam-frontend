import { useMemo } from 'react';

import { getEvenementVergunningLineItems } from './EvenementVergunning';
import { getRVVSloterwegLineItems } from './RvvSloterweg';
import { VergunningFrontendV2 } from '../../../../server/services/vergunningen-v2/config-and-types';
import { GenericDocument, StatusLineItem } from '../../../../universal/types';
import { CaseTypeV2 } from '../../../../universal/types/vergunningen';
import StatusLine from '../../../components/StatusLine/StatusLine';

function useVergunningStatusLineItems(vergunning?: VergunningFrontendV2) {
  const statusLineItems: StatusLineItem[] = useMemo(() => {
    if (!vergunning) {
      return [];
    }

    switch (vergunning.caseType) {
      case CaseTypeV2.EvenementVergunning:
        return getEvenementVergunningLineItems(vergunning);
      case CaseTypeV2.RVVSloterweg:
        return getRVVSloterwegLineItems(vergunning);
    }

    const isDone = vergunning.processed;
    const hasDateWorkflowActive = !!(
      'dateWorkflowActive' in vergunning && vergunning.dateWorkflowActive
    );
    const inProgressActive = hasDateWorkflowActive && !isDone;

    const lineItems: StatusLineItem[] = [
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
        datePublished:
          hasDateWorkflowActive &&
          typeof vergunning.dateWorkflowActive === 'string'
            ? vergunning.dateWorkflowActive
            : '',
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
  vergunning: VergunningFrontendV2;
  trackPath?: (document: GenericDocument) => string;
}) {
  const statusLineItems = useVergunningStatusLineItems(vergunning);

  if (!statusLineItems.length) {
    return null;
  }
  return (
    <StatusLine
      trackCategory="Vergunningen detail / status"
      items={statusLineItems}
      id={`vergunning-detail-${vergunning.id}`}
      documentPathForTracking={trackPath}
    />
  );
}
