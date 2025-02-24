import { AVGRequestFrontend } from './types';
import { StatusLineItem } from '../../../universal/types';

function createStatusLineItem(
  id: string,
  status: string,
  datePublished: string,
  isActive: boolean,
  isChecked: boolean,
  description: string = ''
): StatusLineItem {
  return {
    id,
    status,
    datePublished: datePublished || '',
    description,
    documents: [],
    isActive,
    isChecked,
  };
}

export function getAvgStatusLineItems(
  request: AVGRequestFrontend
): StatusLineItem[] {
  const isDone = !!request.datumAfhandeling;
  const extraInfoActive = !!request.opschortenGestartOp;
  const inProgressActive = !!request.datumInBehandeling;
  const noProgress = !inProgressActive && !extraInfoActive && !isDone;

  const inProgressDate = new Date(request.datumInBehandeling);
  const extraInfoDate = new Date(request.opschortenGestartOp);

  const extraInfoDesc =
    'Wij hebben meer informatie nodig om uw verzoek in behandeling te nemen. U krijgt een brief waarin staat welke informatie wij nodig hebben.';
  const doneDesc =
    'Uw verzoek is afgehandeld. U ontvangt hierover bericht per e-mail of per brief.';

  const lineItems: StatusLineItem[] = [
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
    lineItems.push(
      createStatusLineItem(
        'item-3',
        'In behandeling',
        request.datumInBehandeling,
        false,
        false
      ),
      createStatusLineItem(
        'last-item',
        'Afgehandeld',
        request.datumAfhandeling,
        false,
        false
      )
    );
    return lineItems;
  }

  if (!extraInfoActive && inProgressActive) {
    lineItems.push(
      createStatusLineItem(
        'item-3',
        'In behandeling',
        request.datumInBehandeling,
        inProgressActive && !isDone,
        inProgressActive
      )
    );
  } else if (extraInfoActive && !inProgressActive) {
    lineItems.push(
      createStatusLineItem(
        'item-2',
        'Meer informatie nodig',
        request.opschortenGestartOp,
        true,
        false,
        extraInfoDesc
      ),
      createStatusLineItem(
        'item-3',
        'In behandeling',
        request.datumInBehandeling,
        false,
        false
      )
    );
  } else if (extraInfoActive && inProgressActive) {
    if (inProgressDate <= extraInfoDate) {
      lineItems.push(
        createStatusLineItem(
          'item-3',
          'In behandeling',
          request.datumInBehandeling,
          false,
          true
        ),
        createStatusLineItem(
          'item-2',
          'Meer informatie nodig',
          request.opschortenGestartOp,
          !isDone,
          true,
          extraInfoDesc
        )
      );
    } else {
      lineItems.push(
        createStatusLineItem(
          'item-2',
          'Meer informatie nodig',
          request.opschortenGestartOp,
          false,
          true
        ),
        createStatusLineItem(
          'item-3',
          'In behandeling',
          request.datumInBehandeling,
          !isDone,
          true,
          extraInfoDesc
        )
      );
    }
  }

  lineItems.push(
    createStatusLineItem(
      'last-item',
      'Afgehandeld',
      request.datumAfhandeling,
      isDone,
      isDone,
      isDone ? doneDesc : ''
    )
  );

  return lineItems;
}
