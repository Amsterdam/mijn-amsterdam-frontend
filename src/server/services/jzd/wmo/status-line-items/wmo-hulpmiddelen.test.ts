import { describe, expect, it } from 'vitest';

import { hulpmiddelen } from './wmo-hulpmiddelen.ts';
import {
  DOC_BESLUIT,
  DOC_MEER_INFORMATIE,
  getAanvraagTransformed,
  getVisibleStatusLineItems,
} from './wmo-status-line-items.test-utils.ts';

describe('wmo-hulpmiddelen status line items output', () => {
  it('renders all possible visible steps for this config, including delivery and Einde recht', () => {
    const aanvraag = getAanvraagTransformed({
      productsoortCode: 'AUT',
      datumOpdrachtLevering: '2024-06-12',
      datumBeginLevering: '2024-06-13',
      documenten: [DOC_MEER_INFORMATIE, DOC_BESLUIT],
    });

    const lineItems = getVisibleStatusLineItems(hulpmiddelen, aanvraag);

    expect(lineItems.map((item) => item.status)).toEqual([
      'Aanvraag ontvangen',
      'In behandeling',
      'Meer informatie nodig',
      'Besluit genomen',
      'Opdracht gegeven',
      'Product geleverd',
      'Einde recht',
    ]);
  });

  describe('keeps Einde recht active while opdracht gegeven and product geleverd are not active when ended', () => {
    const aanvraag = getAanvraagTransformed({
      productsoortCode: 'AUT',
      isActueel: false,
      datumEindeGeldigheid: '2099-01-01',
      documenten: [DOC_BESLUIT],
    });

    const lineItems = getVisibleStatusLineItems(hulpmiddelen, aanvraag);

    const opdrachtGegeven = lineItems.find(
      (item) => item.status === 'Opdracht gegeven'
    );
    const productGeleverd = lineItems.find(
      (item) => item.status === 'Product geleverd'
    );
    const eindeRecht = lineItems.find((item) => item.status === 'Einde recht');

    test('Opdracht gegeven and Product geleverd are not active and not checked when ended before product could be delivered', () => {
      expect(opdrachtGegeven).toMatchObject({
        isVisible: true,
        isChecked: false,
        isActive: false,
      });
      expect(productGeleverd).toMatchObject({
        isVisible: true,
        isChecked: false,
        isActive: false,
      });
      expect(eindeRecht).toMatchObject({
        isActive: true,
        isChecked: true,
        datePublished: '2099-01-01',
      });
    });
  });
});
