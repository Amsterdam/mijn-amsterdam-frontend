import { useMemo } from 'react';
import { Vergunning } from '../../../server/services/vergunningen';
import StatusLine, {
  StatusLineItem,
} from '../../components/StatusLine/StatusLine';
import styles from './VergunningDetail.module.scss';

function getStatus(decision: string) {
  if (decision.includes('Verleend')) {
    return 'Verleend';
  }
  if (decision.includes('Geweigerd')) {
    return 'geweigerd';
  }
  if (decision.includes('Ingetrokken')) {
    return 'Ingetrokken';
  }
  return '';
}

function useVergunningStatusLineItems(vergunning?: Vergunning) {
  const statusLineItems: StatusLineItem[] = useMemo(() => {
    if (!vergunning) {
      return [];
    }

    let isDone = vergunning.status === 'Afgehandeld';
    if (vergunning.caseType === 'Vakantieverhuur vergunningsaanvraag') {
      isDone =
        vergunning.status === 'Afgehandeld' &&
        !!vergunning.decision?.includes('ingetrokken');
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
          isActive: !isDone,
          isChecked: true,
        },
        {
          id: 'item-3',
          status: 'Ingetrokken',
          datePublished: vergunning.dateDecision || '',
          description: '',
          documents: [],
          isActive: isDone,
          isChecked: isDone,
        },
      ];
    }
    if (vergunning.caseType === 'Vakantieverhuur') {
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
          status: 'Gemeld',
          datePublished: vergunning.dateRequest,
          description: '',
          documents: [],
          isActive: false,
          isChecked: true,
        },
      ];
    }
    if (vergunning.caseType === 'Vakantieverhuur afmelding') {
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
          status: 'Gemeld',
          datePublished: vergunning.dateRequest,
          description: '',
          documents: [],
          isActive: false,
          isChecked: true,
        },
        {
          id: 'item-3',
          status: 'Geannuleerd',
          datePublished: vergunning.dateRequest,
          description: '',
          documents: [],
          isActive: true,
          isChecked: true,
        },
      ];
    }
    if (vergunning.caseType === 'B&B - vergunning') {
      isDone = vergunning.status === 'Afgehandeld';

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
          isChecked: isDone || vergunning.status === 'Behandelen aanvraag',
        },
        {
          id: 'item-3',
          status: getStatus(vergunning.decision ?? ''),
          datePublished: vergunning.dateDecision ?? '',
          description: '',
          documents: [],
          isActive: isDone,
          isChecked: isDone,
        },
      ];
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
