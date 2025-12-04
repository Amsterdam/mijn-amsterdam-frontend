import {
  differenceInCalendarDays,
  differenceInYears,
  parseISO,
} from 'date-fns';

import type { TipsPredicateFN } from './tip-types';
import type { AppStateBase } from '../../../universal/types/App.types';
import type { Kind } from '../brp/brp-types';
import { isAmsterdamAddress } from '../buurt/helpers';
import type { HLIRegelingFrontend } from '../hli/hli-regelingen-types';
import type { BBVergunningFrontend } from '../toeristische-verhuur/bed-and-breakfast/bed-and-breakfast-types';
import type { WMOVoorzieningFrontend } from '../wmo/wmo-types';
import type { WpiRequestProcess } from '../wpi/wpi-types';

// rule 2
export const is18OrOlder: TipsPredicateFN = (
  appState,
  today: Date = new Date()
) => {
  const AGE_18 = 18;
  const age = differenceInYears(
    today,
    appState.BRP?.content?.persoon.geboortedatum
      ? new Date(appState.BRP.content.persoon.geboortedatum)
      : today
  );
  return age >= AGE_18;
};

// rule 12
export const hasStadspasGroeneStip: TipsPredicateFN = (appState) => {
  if (appState.HLI?.status === 'OK') {
    const stadspassen = appState.HLI?.content?.stadspas?.stadspassen ?? [];
    return !!stadspassen.length;
  }
  return false;
};

export function hasBudget(
  titleMatchInLowerCaseLetters: string
): TipsPredicateFN {
  const predicate: TipsPredicateFN = (appState) => {
    if (appState.HLI?.status === 'OK') {
      const stadspassen = appState.HLI?.content?.stadspas?.stadspassen ?? [];
      return stadspassen.some((stadspas) => {
        return stadspas.budgets.some((budget) => {
          return budget.title
            .toLowerCase()
            .includes(titleMatchInLowerCaseLetters);
        });
      });
    }
    return false;
  };
  return predicate;
}

export const hasValidRecentStadspasRequest: TipsPredicateFN = (
  appState,
  today: Date = new Date()
) => {
  if (appState.HLI?.status === 'OK') {
    return !!appState.HLI?.content?.regelingen.some(
      (aanvraag: HLIRegelingFrontend) => {
        return aanvraag.dateDecision
          ? differenceInYears(today, parseISO(aanvraag.dateDecision)) <= 1 &&
              aanvraag.decision === 'toegewezen' &&
              aanvraag.title.includes('Stadspas')
          : false;
      }
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

/** This is inclusive e.q. {from: 18, to: 19} will be true for someone of 19.9 years old */
export function hasKidsBetweenAges({
  from,
  to,
}: {
  from: number;
  to: number;
}): TipsPredicateFN {
  function hasKidsBetweenAgesFromTo(
    appState: Partial<AppStateBase>,
    today: Date = new Date()
  ): boolean {
    return !!appState.BRP?.content?.kinderen?.some(
      (kind: Kind) =>
        kind.geboortedatum &&
        !kind.overlijdensdatum &&
        differenceInYears(today, new Date(kind.geboortedatum)) >= from &&
        differenceInYears(today, new Date(kind.geboortedatum)) <= to
    );
  }
  return hasKidsBetweenAgesFromTo;
}

/** This is inclusive e.q. {from: 18, to: 19} will be true for someone of 19.9 years old */
export function isBetweenAges({
  from,
  to,
}: {
  from: number;
  to: number;
}): TipsPredicateFN {
  function isBetweenAgesFromTo(
    appState: Partial<AppStateBase>,
    today: Date = new Date()
  ): boolean {
    const geboortedatum = appState.BRP?.content?.persoon?.geboortedatum;

    if (!geboortedatum) {
      return false;
    }

    return (
      differenceInYears(today, new Date(geboortedatum)) >= from &&
      differenceInYears(today, new Date(geboortedatum)) <= to
    );
  }
  return isBetweenAgesFromTo;
}

export const hasOldestKidBornFrom2016: TipsPredicateFN = (appState) => {
  const yearFrom = 2016;
  const yearTo = 2024;
  const oldestKid = appState.BRP?.content?.kinderen?.sort((a, b) =>
    a.geboortedatum && b.geboortedatum
      ? new Date(a.geboortedatum).getTime() -
        new Date(b.geboortedatum).getTime()
      : 0
  )[0];

  if (!oldestKid?.geboortedatum) {
    return false;
  }

  const birthYear = new Date(oldestKid?.geboortedatum).getFullYear();
  return birthYear >= yearFrom && birthYear < yearTo;
};

// Rule 13
export const hasDutchNationality: TipsPredicateFN = (appState) => {
  return !!appState.BRP?.content?.persoon?.nationaliteiten.some(
    (n: { omschrijving: string }) => n.omschrijving === 'Nederlandse'
  );
};

export const hasToeristicheVerhuurVergunningen: TipsPredicateFN = (
  appState
) => {
  return !!appState.TOERISTISCHE_VERHUUR?.content?.vakantieverhuurVergunningen
    .length;
};

export const isMarriedOrLivingTogether: TipsPredicateFN = (appState) => {
  return (
    !!appState.BRP?.content?.verbintenis?.datumSluiting &&
    !appState.BRP?.content?.verbintenis?.datumOntbindingFormatted
  );
};

export const hasBnBVergunning: TipsPredicateFN = (appState) => {
  return !!appState.TOERISTISCHE_VERHUUR?.content?.bbVergunningen.length;
};

export const hasBnBTransitionRight: TipsPredicateFN = (appState) => {
  return !!appState.TOERISTISCHE_VERHUUR?.content?.bbVergunningen.some(
    (vergunning: BBVergunningFrontend) => vergunning.heeftOvergangsRecht
  );
};

export const hasVerhuurRegistrations: TipsPredicateFN = (appState) => {
  return !!appState.TOERISTISCHE_VERHUUR?.content?.lvvRegistraties?.length;
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
