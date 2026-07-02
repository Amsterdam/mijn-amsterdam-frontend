import { describe, expect, it } from 'vitest';

import { WMO_AFWIJZING_ALL } from './wmo-afwijzing-all.ts';
import {
  DOC_BESLUIT,
  DOC_MEER_INFORMATIE,
  getAanvraagTransformed,
  getVisibleStatusLineItems,
} from './wmo-status-line-items.test-utils.ts';

describe('wmo-afwijzing-all status line items output', () => {
  it('renders all possible visible steps for this config', () => {
    const aanvraag = getAanvraagTransformed({
      resultaat: 'afgewezen',
      documenten: [DOC_MEER_INFORMATIE, DOC_BESLUIT],
    });

    const lineItems = getVisibleStatusLineItems(WMO_AFWIJZING_ALL, aanvraag);

    expect(lineItems.map((item) => item.status)).toEqual([
      'Aanvraag ontvangen',
      'In behandeling',
      'Meer informatie nodig',
      'Besluit genomen',
    ]);
  });
});
