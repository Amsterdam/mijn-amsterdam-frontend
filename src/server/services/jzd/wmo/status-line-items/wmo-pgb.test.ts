import { describe, expect, it } from 'vitest';

import { PGB } from './wmo-pgb.ts';
import {
  DOC_BESLUIT,
  DOC_MEER_INFORMATIE,
  getAanvraagTransformed,
  getVisibleStatusLineItems,
} from './wmo-status-line-items.test-utils.ts';

describe('wmo-pgb status line items output', () => {
  it('renders all possible visible steps for this config, including Einde recht', () => {
    const aanvraag = getAanvraagTransformed({
      leveringsVorm: 'PGB',
      productsoortCode: 'AO3',
      documenten: [DOC_MEER_INFORMATIE, DOC_BESLUIT],
    });

    const lineItems = getVisibleStatusLineItems(PGB, aanvraag);

    expect(lineItems.map((item) => item.status)).toEqual([
      'Aanvraag ontvangen',
      'In behandeling',
      'Meer informatie nodig',
      'Besluit genomen',
      'Einde recht',
    ]);
  });
});
