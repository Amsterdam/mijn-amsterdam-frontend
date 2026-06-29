import { describe, expect, it } from 'vitest';

import {
  DOC_BESLUIT,
  DOC_MEER_INFORMATIE,
  getAanvraagTransformed,
  getVisibleStatusLineItems,
} from './wmo-status-line-items.test-utils.ts';
import { vergoeding } from './wmo-vergoeding.ts';

describe('wmo-vergoeding status line items output', () => {
  it('renders all possible visible steps for this config, including Einde recht', () => {
    const aanvraag = getAanvraagTransformed({
      productsoortCode: 'FIN',
      documenten: [DOC_MEER_INFORMATIE, DOC_BESLUIT],
    });

    const lineItems = getVisibleStatusLineItems(vergoeding, aanvraag);

    expect(lineItems.map((item) => item.status)).toEqual([
      'Aanvraag ontvangen',
      'In behandeling',
      'Meer informatie nodig',
      'Besluit genomen',
      'Einde recht',
    ]);
  });
});
