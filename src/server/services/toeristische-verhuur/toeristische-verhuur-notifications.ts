import { subMonths } from 'date-fns';
import { generatePath } from 'react-router';

import { fetchToeristischeVerhuur } from './toeristische-verhuur';
import {
  LVVRegistratie,
  ToeristischeVerhuurVergunning,
} from './toeristische-verhuur-config-and-types';
import {
  routeConfig,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { dateFormat, isDateInPast } from '../../../universal/helpers/date';
import { isRecentNotification } from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END } from '../vergunningen/config-and-types';
import { isNearEndDate } from '../vergunningen/vergunningen-helpers';

export function createToeristischeVerhuurNotification(
  vergunning: ToeristischeVerhuurVergunning,
  dateNow: Date = new Date()
): MyNotification {
  const vergunningTitleLower = vergunning.title.toLowerCase();

  let title = `Aanvraag ${vergunningTitleLower} in behandeling`;
  let description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${vergunning.identifier} in behandeling.`;
  let datePublished =
    vergunning.steps.find((step) => step.status === 'In behandeling')
      ?.datePublished ??
    vergunning.dateRequest ??
    '';
  let cta = 'Bekijk uw aanvraag';
  let linkTo: string = routeConfig.themaPage.path;

  if (
    vergunning.title === 'Vergunning bed & breakfast' ||
    vergunning.title === 'Vergunning vakantieverhuur'
  ) {
    const ctaLinkToDetail = generatePath(routeConfig.detailPage.path, {
      id: vergunning.id,
      caseType:
        vergunning.title === 'Vergunning vakantieverhuur'
          ? 'vakantieverhuur'
          : 'bed-and-breakfast',
    });
    const ctaLinkToAanvragen =
      vergunning.title === 'Vergunning bed & breakfast'
        ? 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/vergunning/'
        : 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/vergunning/';

    linkTo = ctaLinkToDetail;

    switch (true) {
      // B&B + Vakantieverhuurvergunning
      case vergunning.isVerleend &&
        !!vergunning.dateStart &&
        !!vergunning.dateEnd &&
        isNearEndDate(vergunning.dateStart, vergunning.dateEnd):
        title = `Uw ${vergunningTitleLower} loopt af`;
        description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${vergunning.identifier} loopt binnenkort af. Vraag op tijd een nieuwe vergunning aan.`;
        cta = `Vergunning aanvragen`;
        linkTo = ctaLinkToAanvragen;
        datePublished = vergunning.dateEnd
          ? dateFormat(
              subMonths(
                new Date(vergunning.dateEnd),
                NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END
              ),
              'yyyy-MM-dd'
            )
          : datePublished;
        break;
      // B&B + Vakantieverhuurvergunning
      case vergunning.isVerleend &&
        !!vergunning.dateEnd &&
        isDateInPast(vergunning.dateEnd, dateNow):
        title = `Uw ${vergunningTitleLower} is verlopen`;
        description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${vergunning.identifier} is verlopen. U kunt een nieuwe vergunning aanvragen.`;
        cta = 'Vergunning aanvragen';
        linkTo = ctaLinkToAanvragen;
        datePublished = vergunning.dateEnd;
        break;
      // B&B only
      case vergunning.displayStatus === 'Ontvangen':
        title = `Aanvraag ${vergunningTitleLower} ontvangen`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${vergunning.identifier} ontvangen.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished = vergunning.dateRequest ?? '';
        break;
      // B&B only
      case vergunning.displayStatus === 'Meer informatie nodig':
        title = `Aanvraag ${vergunningTitleLower}: meer informatie nodig`;
        description = `Wij hebben meer informatie en tijd nodig om uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${vergunning.identifier} te behandelen.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished =
          vergunning.steps.find(
            (step) => step.status === 'Meer informatie nodig'
          )?.datePublished ?? '';
        break;
      // B&B + Vakantieverhuurvergunning
      case !!vergunning.decision:
        title = `Aanvraag ${vergunningTitleLower} ${vergunning.decision.toLowerCase()}`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${vergunning.identifier} ${vergunning.decision.toLowerCase()}.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished =
          (vergunning.dateDecision || vergunning.dateRequest) ?? '';
        break;
    }
  }

  return {
    id: `vergunning-${vergunning.id}-notification`,
    datePublished,
    themaID: themaId,
    themaTitle: themaTitle,
    title,
    description,
    link: {
      to: linkTo,
      title: cta,
    },
  };
}

function createRegistratieNotification(
  vergunning: LVVRegistratie
): MyNotification {
  const title = 'Aanvraag landelijk registratienummer toeristische verhuur';
  const description = `Uw landelijke registratienummer voor toeristische verhuur is toegekend. Uw registratienummer is ${vergunning.registrationNumber}.`;
  const datePublished = vergunning.agreementDate
    ? vergunning.agreementDate
    : '';
  const cta = 'Bekijk uw overzicht toeristische verhuur';
  const linkTo = routeConfig.themaPage.path;

  return {
    id: `toeristiche-verhuur-registratie-${vergunning.registrationNumber}-notification`,
    datePublished,
    themaID: themaId,
    themaTitle: themaTitle,
    title,
    description,
    link: {
      to: linkTo,
      title: cta,
    },
  };
}

function hasNotification(
  vergunning: ToeristischeVerhuurVergunning,
  compareToDate: Date
) {
  return (
    !vergunning.processed ||
    (!!vergunning.dateDecision &&
      isRecentNotification(vergunning.dateDecision, compareToDate))
  );
}

export async function fetchToeristischeVerhuurNotifications(
  authProfileAndToken: AuthProfileAndToken,
  compareDate?: Date
) {
  const TOERISTISCHE_VERHUUR =
    await fetchToeristischeVerhuur(authProfileAndToken);

  const compareToDate = compareDate || new Date();

  const vakantieverhuurVergunningen =
    TOERISTISCHE_VERHUUR.content.vakantieverhuurVergunningen ?? [];
  const vakantieverhuurVergunningNotifications = vakantieverhuurVergunningen
    .filter((vergunning) => hasNotification(vergunning, compareToDate))
    .map((vergunning) => createToeristischeVerhuurNotification(vergunning));
  const bbVergunningen = TOERISTISCHE_VERHUUR.content.bbVergunningen ?? [];
  const vergunningNotifications = bbVergunningen
    .filter((vergunning) => hasNotification(vergunning, compareToDate))
    .map((vergunning) => createToeristischeVerhuurNotification(vergunning));

  const registrationsNotifications =
    TOERISTISCHE_VERHUUR.content.lvvRegistraties
      ?.filter(
        (registratie) =>
          !!registratie.agreementDate &&
          isRecentNotification(registratie.agreementDate, compareToDate)
      )
      ?.map(createRegistratieNotification) ?? [];

  const notifications = [
    ...vakantieverhuurVergunningNotifications,
    ...vergunningNotifications,
    ...registrationsNotifications,
  ];

  return apiSuccessResult({
    notifications,
  });
}
