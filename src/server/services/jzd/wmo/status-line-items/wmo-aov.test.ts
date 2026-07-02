import { describe, expect, it } from 'vitest';

import { AOV } from './wmo-aov.ts';
import {
  DOC_BESLUIT,
  DOC_MEER_INFORMATIE,
  getAanvraagTransformed,
  getVisibleStatusLineItems,
} from './wmo-status-line-items.test-utils.ts';

describe('wmo-aov status line items output', () => {
  it('renders visible steps for this config', () => {
    const aanvraag = getAanvraagTransformed({
      productsoortCode: 'AOV',
      documenten: [DOC_MEER_INFORMATIE, DOC_BESLUIT],
    });

    const lineItems = getVisibleStatusLineItems(AOV, aanvraag);

    expect(lineItems.map((item) => item.status)).toEqual([
      'Aanvraag ontvangen',
      'In behandeling',
      'Meer informatie nodig',
      'Besluit genomen',
      'Einde recht',
    ]);
  });
});
