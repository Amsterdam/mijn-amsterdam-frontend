import { differenceInCalendarYears, differenceInCalendarDays } from 'date-fns';
import { AppState } from '../../../client/AppState';

export type TipsPredicateFN = (
  stateData: Partial<AppState>,
  today: Date
) => boolean;

export const is18OrOlder: TipsPredicateFN = (
  appState,
  today: Date = new Date()
) => {
  return (
    differenceInCalendarYears(
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
  return ids.some((idBewijs) => {
    return today <= new Date(idBewijs.datumAfloop);
  });
};

export const hasStadspasGroeneStip: TipsPredicateFN = (appState) => {
  const stadspassen = appState.WPI_STADSPAS?.content?.stadspassen ?? [];
  return stadspassen.some((stadspas) => stadspas.passType === 'ouder');
};

export const hasValidStadspasRequest: TipsPredicateFN = (
  appState,
  today: Date = new Date()
) => {
  return (
    appState.WPI_STADSPAS?.content?.aanvragen.some(
      (aanvraag) =>
        aanvraag.decision === 'toekenning' &&
        differenceInCalendarYears(new Date(aanvraag.datePublished), today) <= 1
    ) || false
  );
};

export const isLivingInAmsterdamSindsNumberOfDays = (
  numberOfDays: number
): TipsPredicateFN => {
  return (stateData, today: Date = new Date()) =>
    differenceInCalendarDays(
      new Date(stateData?.BRP?.content?.adres.begindatumVerblijf ?? ''),
      today
    ) >= numberOfDays;
};

export function not(predicate: TipsPredicateFN): TipsPredicateFN {
  return (stateData, today) => !predicate(stateData, today);
}
