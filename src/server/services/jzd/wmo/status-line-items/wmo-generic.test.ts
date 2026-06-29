import { describe, expect, it } from 'vitest';

import {
  EINDE_RECHT,
  EINDE_RECHT_PGB,
  FAKE_DECISION_DOCUMENT_ID,
  getDecisionDocument,
  getDocumentDecisionDate,
  getDocumentMeerInformatieDate,
  getTransformerConfigBesluit,
  hasDecision,
  hasMeerInformatieNodig,
  isCancelled,
  isDecisionStatusActive,
  isDecisionWithDeliveryStatusActive,
  isDelivered,
  isDeliveredStatusActive,
  isDeliveryStepVisible,
  isDeliveryStopped,
  isDocumentDecisionDateActive,
  isEindeGeldigheidVerstreken,
  isGeleverdVisible,
  isOpdrachtGegeven,
  isOpdrachtGegevenVisible,
} from './wmo-generic.ts';
import {
  DOC_BESLUIT,
  DOC_MEER_INFORMATIE,
  getAanvraagTransformed,
  today,
} from './wmo-status-line-items.test-utils.ts';

describe('wmo-generic', () => {
  describe('decision and document helpers', () => {
    const docs = [
      { ...DOC_BESLUIT, id: 'doc-besluit-1', datePublished: '2024-06-01' },
      { ...DOC_MEER_INFORMATIE },
      { ...DOC_BESLUIT, id: 'doc-besluit-2', datePublished: '2024-06-10' },
    ];

    const withDocumentMode = getAanvraagTransformed({
      datumAanvraag: '2024-01-01',
      documenten: [DOC_BESLUIT],
      resultaat: 'toegewezen',
    });
    const withDocumentModeNoDecisionDoc = getAanvraagTransformed({
      datumAanvraag: '2024-01-01',
      documenten: [DOC_MEER_INFORMATIE],
      resultaat: 'toegewezen',
    });
    const withLegacyMode = getAanvraagTransformed({
      datumAanvraag: '2021-12-31',
      documenten: [],
      resultaat: 'toegewezen',
    });
    const aanvraagWithRequest = getAanvraagTransformed({
      documenten: [DOC_MEER_INFORMATIE],
      datumAanvraag: '2024-01-01',
    });
    const cancelledAanvraag = getAanvraagTransformed({
      datumIngangGeldigheid: '2024-06-14',
      datumEindeGeldigheid: '2024-06-14',
    });

    it('getDecisionDocument returns the latest besluit document', () => {
      expect(getDecisionDocument(docs)?.id).toBe('doc-besluit-2');
      expect(getDocumentDecisionDate(docs)).toBe('2024-06-10');
    });

    it('getDocumentMeerInformatieDate returns the verzoek date', () => {
      expect(getDocumentMeerInformatieDate(docs)).toBe('2024-06-09');
    });

    it('hasDecision is true in document mode when besluit doc exists', () => {
      expect(hasDecision(withDocumentMode)).toBe(true);
    });

    it('hasDecision is false in document mode when besluit doc is missing', () => {
      expect(hasDecision(withDocumentModeNoDecisionDoc)).toBe(false);
    });

    it('hasDecision is true in legacy mode when resultaat is set', () => {
      expect(hasDecision(withLegacyMode)).toBe(true);
    });

    it('hasMeerInformatieNodig is true when verzoek doc exists', () => {
      expect(hasMeerInformatieNodig(aanvraagWithRequest)).toBe(true);
    });

    it('isDocumentDecisionDateActive is true after WCAG threshold', () => {
      expect(
        isDocumentDecisionDateActive(aanvraagWithRequest.datumAanvraag)
      ).toBe(true);
    });

    it('isCancelled is true when start and end validity dates are equal', () => {
      expect(isCancelled(cancelledAanvraag)).toBe(true);
    });
  });

  describe('delivery and visibility predicates', () => {
    const delivered = getAanvraagTransformed({
      datumBeginLevering: '2024-06-13',
      datumEindeLevering: null,
      datumEindeGeldigheid: '2099-01-01',
      isActueel: true,
    });
    const stopped = getAanvraagTransformed({
      datumBeginLevering: '2024-06-13',
      datumEindeLevering: '2024-06-14',
      datumEindeGeldigheid: '2099-01-01',
      isActueel: true,
    });
    const withDecision = getAanvraagTransformed({
      documenten: [DOC_BESLUIT],
      resultaat: 'toegewezen',
      datumEindeGeldigheid: '2099-01-01',
      datumOpdrachtLevering: null,
      datumBeginLevering: null,
    });
    const withDecisionAndOpdracht = getAanvraagTransformed({
      documenten: [DOC_BESLUIT],
      resultaat: 'toegewezen',
      datumOpdrachtLevering: '2024-06-12',
      datumBeginLevering: null,
      datumEindeGeldigheid: '2099-01-01',
    });

    it('isEindeGeldigheidVerstreken is true for a past/same date', () => {
      expect(isEindeGeldigheidVerstreken('2024-06-15', today)).toBe(true);
    });

    it('isEindeGeldigheidVerstreken is false for a far future date', () => {
      expect(isEindeGeldigheidVerstreken('2099-01-01', today)).toBe(false);
    });

    it('isDelivered is true when delivery start date is in the past', () => {
      expect(isDelivered(delivered, today)).toBe(true);
    });

    it('isDeliveryStopped is true when delivery end date is in the past', () => {
      expect(isDeliveryStopped(stopped, today)).toBe(true);
    });

    it('isDeliveredStatusActive is true for delivered and still active requests', () => {
      expect(isDeliveredStatusActive(delivered, today)).toBe(true);
    });

    it('isDeliveredStatusActive is false when delivery is stopped', () => {
      expect(isDeliveredStatusActive(stopped, today)).toBe(false);
    });

    it('isDecisionStatusActive is true when decision exists and request is active', () => {
      expect(isDecisionStatusActive(withDecision)).toBe(true);
    });

    it('isDecisionWithDeliveryStatusActive is true before opdracht is given', () => {
      expect(isDecisionWithDeliveryStatusActive(withDecision, today)).toBe(
        true
      );
    });

    it('isDecisionWithDeliveryStatusActive is false after opdracht is given', () => {
      expect(
        isDecisionWithDeliveryStatusActive(withDecisionAndOpdracht, today)
      ).toBe(false);
    });

    it('isDeliveryStepVisible is true when decision exists and request not ended', () => {
      expect(isDeliveryStepVisible(withDecision, today)).toBe(true);
    });

    it('isOpdrachtGegeven is true when opdracht date is in the past', () => {
      expect(isOpdrachtGegeven(withDecisionAndOpdracht, today)).toBe(true);
    });

    it('isOpdrachtGegevenVisible is true when decision exists and request not ended', () => {
      expect(isOpdrachtGegevenVisible(withDecision, today)).toBe(true);
    });

    it('isGeleverdVisible is true for decision requests with opdracht context', () => {
      expect(isGeleverdVisible(withDecisionAndOpdracht, today)).toBe(true);
    });
  });

  describe('besluit transformer', () => {
    const aanvraag = getAanvraagTransformed({
      documenten: [DOC_BESLUIT],
      titel: 'hulpmiddel',
      resultaat: 'toegewezen',
      datumIngangGeldigheid: '2024-07-01',
    });
    const aanvraagWithFakeDecision = getAanvraagTransformed({
      documenten: [{ ...DOC_BESLUIT, id: FAKE_DECISION_DOCUMENT_ID }],
    });
    const transformer = getTransformerConfigBesluit(() => true, true);

    it('has status Besluit genomen', () => {
      expect(transformer.status).toBe('Besluit genomen');
    });

    it('returns decision date as datePublished', () => {
      expect(
        typeof transformer.datePublished === 'function' &&
          transformer.datePublished(aanvraag, today, [aanvraag])
      ).toBe('2024-06-10');
    });

    it('marks isChecked as true when decision exists', () => {
      expect(
        typeof transformer.isChecked === 'function' &&
          transformer.isChecked(aanvraag, today, [aanvraag])
      ).toBe(true);
    });

    it('is visible for regular besluit documents', () => {
      expect(
        typeof transformer.isVisible === 'function' &&
          transformer.isVisible?.(aanvraag, today, [aanvraag])
      ).toBe(true);
    });

    it('description mentions the provided product', () => {
      expect(
        typeof transformer.description === 'function' &&
          transformer.description(aanvraag, today, [aanvraag])
      ).toContain('U krijgt een hulpmiddel');
    });

    it('is not visible for fake besluit documents', () => {
      expect(
        typeof transformer.isVisible === 'function' &&
          transformer.isVisible?.(aanvraagWithFakeDecision, today, [
            aanvraagWithFakeDecision,
          ])
      ).toBe(false);
    });
  });

  describe('einde recht transformers', () => {
    const activeWithDecision = getAanvraagTransformed({
      documenten: [DOC_BESLUIT],
      resultaat: 'toegewezen',
      isActueel: true,
      titel: 'voorziening',
      datumEindeGeldigheid: '2024-12-31',
      leveringsVorm: 'PGB',
    });
    const endedWithDecision = getAanvraagTransformed({
      documenten: [DOC_BESLUIT],
      resultaat: 'toegewezen',
      isActueel: false,
      titel: 'voorziening',
      datumEindeGeldigheid: '2024-06-14',
      leveringsVorm: 'PGB',
    });

    it('EINDE_RECHT is visible for active requests with decision', () => {
      expect(
        typeof EINDE_RECHT.isVisible === 'function' &&
          EINDE_RECHT.isVisible?.(activeWithDecision, today, [
            activeWithDecision,
          ])
      ).toBe(true);
    });

    it('EINDE_RECHT isChecked is false while request is active', () => {
      expect(
        typeof EINDE_RECHT.isChecked === 'function' &&
          EINDE_RECHT.isChecked(activeWithDecision, today, [activeWithDecision])
      ).toBe(false);
    });

    it('EINDE_RECHT datePublished is empty while request is active', () => {
      expect(
        typeof EINDE_RECHT.datePublished === 'function' &&
          EINDE_RECHT.datePublished(activeWithDecision, today, [
            activeWithDecision,
          ])
      ).toBe('');
    });

    it('EINDE_RECHT isChecked is true when request ended', () => {
      expect(
        typeof EINDE_RECHT.isChecked === 'function' &&
          EINDE_RECHT.isChecked(endedWithDecision, today, [endedWithDecision])
      ).toBe(true);
    });

    it('EINDE_RECHT isActive is true when request ended', () => {
      expect(
        typeof EINDE_RECHT.isActive === 'function' &&
          EINDE_RECHT.isActive(endedWithDecision, today, [endedWithDecision])
      ).toBe(true);
    });

    it('EINDE_RECHT datePublished returns the end date when ended', () => {
      expect(
        typeof EINDE_RECHT.datePublished === 'function' &&
          EINDE_RECHT.datePublished(endedWithDecision, today, [
            endedWithDecision,
          ])
      ).toBe('2024-06-14');
    });

    it('EINDE_RECHT_PGB description includes extension guidance for active PGB', () => {
      expect(
        typeof EINDE_RECHT_PGB.description === 'function' &&
          EINDE_RECHT_PGB.description(activeWithDecision, today, [
            activeWithDecision,
          ])
      ).toContain('Wilt u verlenging aanvragen');
    });

    it('EINDE_RECHT_PGB description indicates ended state for inactive request', () => {
      expect(
        typeof EINDE_RECHT_PGB.description === 'function' &&
          EINDE_RECHT_PGB.description(endedWithDecision, today, [
            endedWithDecision,
          ])
      ).toContain('is beëindigd');
    });
  });
});
