import { describe, expect, it } from 'vitest';

import {
  DOC_BESLUIT,
  DOC_MEER_INFORMATIE,
  getAanvraagTransformed,
  getVisibleStatusLineItems,
} from './wmo-status-line-items.test-utils.ts';
import { WRA } from './wmo-wra.ts';

describe('wmo-wra status line items output', () => {
  it('returns only aanvraag, in behandeling and besluit when there is no decision document', () => {
    const aanvraag = getAanvraagTransformed();

    const lineItems = getVisibleStatusLineItems(WRA, aanvraag);

    expect(lineItems.map((item) => item.status)).toEqual([
      'Aanvraag ontvangen',
      'In behandeling',
      'Besluit genomen',
    ]);

    const inBehandeling = lineItems.find(
      (item) => item.status === 'In behandeling'
    );
    const besluit = lineItems.find((item) => item.status === 'Besluit genomen');

    expect(inBehandeling).toMatchObject({
      isChecked: true,
      isActive: true,
    });

    expect(besluit).toMatchObject({
      isChecked: false,
      isActive: false,
    });
  });

  it('returns delivery steps and keeps besluit active when a decision exists but no opdracht is given yet', () => {
    const aanvraag = getAanvraagTransformed({
      documenten: [DOC_BESLUIT],
    });

    const lineItems = getVisibleStatusLineItems(WRA, aanvraag);

    expect(lineItems.map((item) => item.status)).toEqual([
      'Aanvraag ontvangen',
      'In behandeling',
      'Besluit genomen',
      'Opdracht gegeven',
      'Aanpassing uitgevoerd',
      'Einde recht',
    ]);

    const besluit = lineItems.find((item) => item.status === 'Besluit genomen');
    const opdracht = lineItems.find(
      (item) => item.status === 'Opdracht gegeven'
    );

    expect(besluit).toMatchObject({
      isChecked: true,
      isActive: true,
      datePublished: '2024-06-10',
    });

    expect(opdracht).toMatchObject({
      isChecked: false,
      isActive: false,
    });
  });

  it('marks opdracht gegeven as active when opdracht date has passed and delivery has not started', () => {
    const aanvraag = getAanvraagTransformed({
      datumOpdrachtLevering: '2024-06-12',
      documenten: [DOC_BESLUIT],
    });

    const lineItems = getVisibleStatusLineItems(WRA, aanvraag);

    const besluit = lineItems.find((item) => item.status === 'Besluit genomen');
    const opdracht = lineItems.find(
      (item) => item.status === 'Opdracht gegeven'
    );
    const uitvoering = lineItems.find(
      (item) => item.status === 'Aanpassing uitgevoerd'
    );

    expect(besluit).toMatchObject({
      isChecked: true,
      isActive: false,
    });

    expect(opdracht).toMatchObject({
      isChecked: true,
      isActive: true,
      datePublished: '2024-06-12',
    });

    expect(uitvoering).toMatchObject({
      isChecked: false,
      isActive: false,
    });
  });

  it('marks aanpassing uitgevoerd as active and checked when delivery date has passed', () => {
    const aanvraag = getAanvraagTransformed({
      datumOpdrachtLevering: '2024-06-12',
      datumBeginLevering: '2024-06-13',
      documenten: [DOC_BESLUIT],
    });

    const lineItems = getVisibleStatusLineItems(WRA, aanvraag);

    const opdracht = lineItems.find(
      (item) => item.status === 'Opdracht gegeven'
    );
    const uitvoering = lineItems.find(
      (item) => item.status === 'Aanpassing uitgevoerd'
    );

    expect(opdracht).toMatchObject({
      isChecked: true,
      isActive: false,
    });

    expect(uitvoering).toMatchObject({
      isChecked: true,
      isActive: true,
      datePublished: '2024-06-13',
    });
  });

  it('shows meer informatie nodig as visible and active when a verzoek document exists and no decision is available', () => {
    const aanvraag = getAanvraagTransformed({
      documenten: [DOC_MEER_INFORMATIE],
    });

    const lineItems = getVisibleStatusLineItems(WRA, aanvraag);

    expect(lineItems.map((item) => item.status)).toEqual([
      'Aanvraag ontvangen',
      'In behandeling',
      'Meer informatie nodig',
      'Besluit genomen',
    ]);

    const inBehandeling = lineItems.find(
      (item) => item.status === 'In behandeling'
    );
    const meerInformatie = lineItems.find(
      (item) => item.status === 'Meer informatie nodig'
    );

    expect(inBehandeling).toMatchObject({
      isChecked: true,
      isActive: false,
    });

    expect(meerInformatie).toMatchObject({
      isChecked: true,
      isActive: true,
      datePublished: '2024-06-09',
    });
  });

  it('can render all possible WRA steps as visible when all step conditions are met', () => {
    const aanvraag = getAanvraagTransformed({
      datumOpdrachtLevering: '2024-06-12',
      datumBeginLevering: '2024-06-13',
      documenten: [DOC_MEER_INFORMATIE, DOC_BESLUIT],
    });

    const lineItems = getVisibleStatusLineItems(WRA, aanvraag);

    expect(lineItems.map((item) => item.status)).toEqual([
      'Aanvraag ontvangen',
      'In behandeling',
      'Meer informatie nodig',
      'Besluit genomen',
      'Opdracht gegeven',
      'Aanpassing uitgevoerd',
      'Einde recht',
    ]);
  });

  it('marks Einde recht as checked and active when the right has ended', () => {
    const aanvraag = getAanvraagTransformed({
      isActueel: false,
      datumEindeGeldigheid: '2024-06-14',
      documenten: [DOC_BESLUIT],
    });

    const lineItems = getVisibleStatusLineItems(WRA, aanvraag);
    const eindeRecht = lineItems.find((item) => item.status === 'Einde recht');

    expect(eindeRecht).toMatchObject({
      isChecked: true,
      isActive: true,
      datePublished: '2024-06-14',
    });
  });
});
