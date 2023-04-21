import { AVGRequest } from '../../../server/services/avg/types';
import { StatusLineItem } from '../../../universal/types';
import { StatusLine } from '../../components';
import styles from './AVGDetail.module.scss';

function useAvgStatusLines(request: AVGRequest): StatusLineItem[] {
  const isDone = !!request.datumAfhandeling;
  const extraInfoActive = !!request.opschortenGestartOp;
  const inProgressActive = !!request.datumInBehandeling;
  const noProgress = !inProgressActive && !extraInfoActive && !isDone;

  const inProgressDate = new Date(request.datumInBehandeling);
  const extraInfoDate = new Date(request.opschortenGestartOp);

  const lineItems = [
    {
      id: 'item-1',
      status: 'Ontvangen',
      datePublished: request.ontvangstDatum,
      description: '',
      documents: [],
      isActive: noProgress,
      isChecked: true,
    },
  ];

  if (noProgress) {
    lineItems.push({
      id: 'item-3',
      status: 'In behandeling',
      datePublished: request.datumInBehandeling || '',
      description: '',
      documents: [],
      isActive: false,
      isChecked: true,
    });

    lineItems.push({
      id: 'last-item',
      status: 'Afgehandeld',
      datePublished: request.datumAfhandeling || '',
      description: '',
      documents: [],
      isActive: false,
      isChecked: false,
    });

    return lineItems;
  }

  switch (true) {
    case !extraInfoActive && inProgressActive:
      lineItems.push({
        id: 'item-3',
        status: 'In behandeling',
        datePublished: request.datumInBehandeling || '',
        description: '',
        documents: [],
        isActive: inProgressActive && !isDone,
        isChecked: inProgressActive,
      });
      break;

    case extraInfoActive && !inProgressActive:
      lineItems.push({
        id: 'item-2',
        status: 'Extra informatie nodig',
        datePublished: request.opschortenGestartOp || '',
        description: '',
        documents: [],
        isActive: true,
        isChecked: false,
      });

      lineItems.push({
        id: 'item-3',
        status: 'In behandeling',
        datePublished: request.datumInBehandeling || '',
        description: '',
        documents: [],
        isActive: false,
        isChecked: false,
      });
      break;

    case extraInfoActive && inProgressActive && inProgressDate <= extraInfoDate:
      lineItems.push({
        id: 'item-3',
        status: 'In behandeling',
        datePublished: request.datumInBehandeling || '',
        description: '',
        documents: [],
        isActive: false,
        isChecked: true,
      });

      lineItems.push({
        id: 'item-2',
        status: 'Extra informatie nodig',
        datePublished: request.opschortenGestartOp || '',
        description: '',
        documents: [],
        isActive: !isDone,
        isChecked: true,
      });
      break;

    case extraInfoActive && inProgressActive && inProgressDate > extraInfoDate:
      lineItems.push({
        id: 'item-2',
        status: 'Extra informatie nodig',
        datePublished: request.opschortenGestartOp || '',
        description: '',
        documents: [],
        isActive: false,
        isChecked: true,
      });

      lineItems.push({
        id: 'item-3',
        status: 'In behandeling',
        datePublished: request.datumInBehandeling || '',
        description: '',
        documents: [],
        isActive: !isDone,
        isChecked: true,
      });
      break;
  }

  lineItems.push({
    id: 'last-item',
    status: 'Afgehandeld',
    datePublished: request.datumAfhandeling || '',
    description: '',
    documents: [],
    isActive: isDone,
    isChecked: isDone,
  });

  return lineItems;
}

const AVGStatusLines = ({ request }: { request: AVGRequest }) => {
  const statusLineItems = useAvgStatusLines(request);

  return (
    <StatusLine
      className={styles.AvgStatusLines}
      trackCategory="AVG verzoek detail / status"
      items={statusLineItems}
      showToggleMore={false}
      id={`avg-detail-${request.id}`}
      documentPathForTracking={(document) =>
        `/downloads/avg-verzoek/${document.title}`
      }
    />
  );
};

export default AVGStatusLines;
