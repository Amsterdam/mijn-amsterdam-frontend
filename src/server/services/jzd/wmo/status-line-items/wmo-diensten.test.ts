import { describe, expect, it } from 'vitest';

import { diensten } from './wmo-diensten.ts';
import {
  DOC_BESLUIT,
  DOC_MEER_INFORMATIE,
  getAanvraagTransformed,
  getVisibleStatusLineItems,
} from './wmo-status-line-items.test-utils.ts';

describe('wmo-diensten status line items output', () => {
  it('renders visible steps for this config, including delivery steps', () => {
    const aanvraag = getAanvraagTransformed({
      productsoortCode: 'AO1',
      datumBeginLevering: '2024-06-13',
      documenten: [DOC_MEER_INFORMATIE, DOC_BESLUIT],
    });

    const lineItems = getVisibleStatusLineItems(diensten, aanvraag);

    expect(lineItems.map((item) => item.status)).toEqual([
      'Aanvraag ontvangen',
      'In behandeling',
      'Meer informatie nodig',
      'Besluit genomen',
      'Levering gestart',
      'Levering gestopt',
      'Einde recht',
    ]);
  });
});
