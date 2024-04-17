import { differenceInCalendarDays, differenceInYears } from 'date-fns';
import type { Identiteitsbewijs, Kind } from '../../../universal/types';
import { CaseType } from '../../../universal/types/vergunningen';
import { isAmsterdamAddress } from '../buurt/helpers';
import type { ToeristischeVerhuurVergunning } from '../toeristische-verhuur';
import { WMOVoorzieningFrontend } from '../wmo/wmo-config-and-types';
import type { WpiRequestProcess } from '../wpi/wpi-types';
import type { TipsPredicateFN } from './tip-types';

// rule 2
export const is18OrOlder: TipsPredicateFN = (
  appState,
  today: Date = new Date()
) => {
  return (
    differenceInYears(
      today,
      appState.BRP?.content?.persoon.geboortedatum
        ? new Date(appState.BRP.content.persoon.geboortedatum)
        : today
    ) >= 18
  );
};

export const hasValidId: TipsPredicateFN = (
  appState,
  today: Date = new Date()
) => {
  const ids = appState.BRP?.content?.identiteitsbewijzen ?? [];
  return ids.some((idBewijs: Identiteitsbewijs) => {
    return today <= new Date(idBewijs.datumAfloop);
  });
};

// To use an ID for voting it needs an expiration date with a maximum of five years ago.
export const hasValidIdForVoting: TipsPredicateFN = (appState) => {
  const dateOfVote = new Date('2023-11-20'); // Minus 2 days for request processing.
  const fiveYearsAgo = new Date(
    dateOfVote.setFullYear(dateOfVote.getFullYear() - 5)
  );
  return hasValidId(appState, fiveYearsAgo);
};

// rule 12
export const hasStadspasGroeneStip: TipsPredicateFN = (appState) => {
  if (appState.STADSPAS?.status === 'OK') {
    const stadspassen = appState.STADSPAS?.content?.stadspassen ?? [];
    return !!stadspassen.length;
  }
  return false;
};

export const hasValidStadspasRequest: TipsPredicateFN = (
  appState,
  today: Date = new Date()
) => {
  if (appState.STADSPAS?.status === 'OK') {
    return appState.STADSPAS?.content?.aanvragen.some(
      (aanvraag: WpiRequestProcess) =>
        aanvraag.decision === 'toekenning' &&
        differenceInYears(today, new Date(aanvraag.datePublished)) <= 1
    );
  }
  return false;
};

export const previouslyLivingInAmsterdam: TipsPredicateFN = (appState) => {
  return !!(
    appState.BRP?.content?.adresHistorisch &&
    isAmsterdamAddress(
      appState.BRP?.content?.adresHistorisch[0]?.woonplaatsNaam
    )
  );
};

export const isLivingInAmsterdamLessThanNumberOfDays = (
  numberOfDays: number = 0
): TipsPredicateFN => {
  return (stateData, today: Date = new Date()) => {
    return (
      differenceInCalendarDays(
        today,
        new Date(stateData?.BRP?.content?.adres?.begindatumVerblijf ?? '')
      ) <= numberOfDays
    );
  };
};

export const hasTozo: TipsPredicateFN = (appState) => {
  return !!(
    appState.WPI_TOZO?.content && appState.WPI_TOZO?.content?.length > 0
  );
};

export const hasBijstandsuitkering: TipsPredicateFN = (
  appState,
  today: Date = new Date()
) => {
  return (
    appState.WPI_AANVRAGEN?.content?.some(
      (aanvraag: WpiRequestProcess) =>
        aanvraag.decision === 'toekenning' &&
        differenceInYears(today, new Date(aanvraag.datePublished)) <= 1
    ) || false
  );
};

export const hasAOV: TipsPredicateFN = (appState) => {
  return !!appState.WMO?.content?.some(
    (wmo: WMOVoorzieningFrontend) => wmo.isActual && wmo.itemTypeCode === 'AOV'
  );
};

export const hasKidsBetweenAges = (
  kinderen: Kind[] | undefined,
  ageFrom: number,
  ageTo: number,
  today: Date = new Date()
) => {
  return !!kinderen?.some(
    (kind: Kind) =>
      kind.geboortedatum &&
      !kind.overlijdensdatum &&
      differenceInYears(today, new Date(kind.geboortedatum)) >= ageFrom &&
      differenceInYears(today, new Date(kind.geboortedatum)) <= ageTo
  );
};

export const hasKidsBetweenAges2And18: TipsPredicateFN = (
  appState,
  today: Date = new Date()
) => {
  return hasKidsBetweenAges(appState.BRP?.content?.kinderen, 2, 18, today);
};

export const hasKidsBetweenAges4And11: TipsPredicateFN = (
  appState,
  today: Date = new Date()
) => {
  return hasKidsBetweenAges(appState.BRP?.content?.kinderen, 4, 11, today);
};

export const hasOldestKidBornFrom2016: TipsPredicateFN = (appState) => {
  const oldestKid = appState.BRP?.content?.kinderen?.sort(
    (a, b) =>
      new Date(a.geboortedatum as string).getTime() -
      new Date(b.geboortedatum as string).getTime()
  )[0];

  if (!oldestKid?.geboortedatum) {
    return false;
  }

  const birthYear = new Date(oldestKid?.geboortedatum).getFullYear();
  return birthYear >= 2016 && birthYear < 2024;
};

// Rule 13
export const hasDutchNationality: TipsPredicateFN = (appState) => {
  return !!appState.BRP?.content?.persoon?.nationaliteiten.some(
    (n: { omschrijving: string }) => n.omschrijving === 'Nederlandse'
  );
};

export const isBetween17and18: TipsPredicateFN = (
  appState,
  today: Date = new Date()
) => {
  const geboortedatum = appState.BRP?.content?.persoon?.geboortedatum;

  if (!geboortedatum) {
    return false;
  }

  return (
    differenceInYears(today, new Date(geboortedatum)) >= 17 &&
    differenceInYears(today, new Date(geboortedatum)) <= 18
  );
};

export const hasToeristicheVerhuurVergunningen: TipsPredicateFN = (
  appState
) => {
  return !!appState.TOERISTISCHE_VERHUUR?.content?.vergunningen.some(
    (v: ToeristischeVerhuurVergunning) =>
      v.caseType === CaseType.VakantieverhuurVergunningaanvraag
  );
};

export const isMarriedOrLivingTogether: TipsPredicateFN = (appState) => {
  return !!appState.BRP?.content?.verbintenis?.soortVerbintenis;
};

export const hasBnBVergunning: TipsPredicateFN = (appState) => {
  return !!appState.TOERISTISCHE_VERHUUR?.content?.vergunningen.some(
    (v: ToeristischeVerhuurVergunning) => v.caseType === CaseType.BBVergunning
  );
};

export const hasBnBTransitionRight: TipsPredicateFN = (appState) => {
  return !!appState.TOERISTISCHE_VERHUUR?.content?.vergunningen.some(
    (v: ToeristischeVerhuurVergunning) =>
      v.caseType === CaseType.BBVergunning && v.hasTransitionAgreement
  );
};

export const hasVerhuurRegistrations: TipsPredicateFN = (appState) => {
  return !!(
    appState.TOERISTISCHE_VERHUUR?.content &&
    appState.TOERISTISCHE_VERHUUR?.content?.registraties?.length >= 1
  );
};

export const isReceivingSubsidy: TipsPredicateFN = (
  appState,
  today: Date = new Date()
) => {
  const hasTozo = appState.WPI_TOZO?.content?.some(
    (r: WpiRequestProcess) =>
      r.decision === 'toekenning' &&
      differenceInYears(today, new Date(r.datePublished)) <= 1
  );
  const hasTonk = appState.WPI_TONK?.content?.some(
    (r: WpiRequestProcess) =>
      r.decision === 'toekenning' &&
      differenceInYears(today, new Date(r.datePublished)) <= 1
  );
  const hasWpi = appState.WPI_AANVRAGEN?.content?.some(
    (r: WpiRequestProcess) =>
      r.about === 'Bijstandsuitkering' &&
      r.decision === 'toekenning' &&
      differenceInYears(today, new Date(r.datePublished)) <= 1
  );

  return !!(hasTozo || hasTonk || hasWpi);
};

export const isMokum: TipsPredicateFN = (appState) => {
  return appState.BRP?.content?.persoon?.mokum || false;
};

export function or(predicates: TipsPredicateFN[]): TipsPredicateFN {
  return (stateData, today) => {
    return predicates
      .map((predicate) => predicate(stateData, today))
      .some((res) => res === true);
  };
}

export function not(predicate: TipsPredicateFN): TipsPredicateFN {
  return (stateData, today) => !predicate(stateData, today);
}
