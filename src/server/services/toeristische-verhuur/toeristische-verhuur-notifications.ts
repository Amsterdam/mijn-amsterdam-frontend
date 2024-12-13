import { subMonths } from 'date-fns';
import { generatePath } from 'react-router-dom';

import { fetchToeristischeVerhuur } from './toeristische-verhuur';
import {
  LVVRegistratie,
  ToeristischeVerhuurVergunning,
} from './toeristische-verhuur-types';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { dateFormat, isDateInPast } from '../../../universal/helpers/date';
import { isRecentNotification } from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END } from '../vergunningen-v2/config-and-types';
import { isNearEndDate } from '../decos/helpers';

export function createToeristischeVerhuurNotification(
  vergunning: ToeristischeVerhuurVergunning,
  items: ToeristischeVerhuurVergunning[],
  dateNow: Date = new Date()
): MyNotification {
  const vergunningTitleLower = vergunning.title.toLowerCase();

  let title = `Aanvraag ${vergunningTitleLower} in behandeling`;
  let description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${vergunning.zaaknummer} in behandeling.`;
  let datePublished =
    vergunning.steps.find((step) => step.status === 'In behandeling')
      ?.datePublished ??
    vergunning.dateReceived ??
    '';
  let cta = 'Bekijk uw aanvraag';
  let linkTo: string = AppRoutes.TOERISTISCHE_VERHUUR;

  if (
    vergunning.title === 'Vergunning bed & breakfast' ||
    vergunning.title === 'Vergunning vakantieverhuur'
  ) {
    const ctaLinkToDetail = generatePath(
      AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
      {
        id: vergunning.id,
        casetype:
          vergunning.title === 'Vergunning vakantieverhuur'
            ? 'vakantieverhuur'
            : 'bed-and-breakfast',
      }
    );
    const ctaLinkToAanvragen =
      vergunning.title === 'Vergunning bed & breakfast'
        ? 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/vergunning/'
        : 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/vergunning/';

    linkTo = ctaLinkToDetail;

    switch (true) {
      // B&B + Vakantieverhuurvergunning
      case vergunning.result === 'Verleend' &&
        !!vergunning.dateEnd &&
        isNearEndDate(vergunning):
        title = `Uw ${vergunningTitleLower} loopt af`;
        description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${vergunning.zaaknummer} loopt binnenkort af. Vraag op tijd een nieuwe vergunning aan.`;
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
      case vergunning.result === 'Verleend' &&
        !!vergunning.dateEnd &&
        isDateInPast(vergunning.dateEnd, dateNow):
        title = `Uw ${vergunningTitleLower} is verlopen`;
        description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${vergunning.zaaknummer} is verlopen. U kunt een nieuwe vergunning aanvragen.`;
        cta = 'Vergunning aanvragen';
        linkTo = ctaLinkToAanvragen;
        datePublished = vergunning.dateEnd;
        break;
      // B&B only
      case vergunning.status === 'Ontvangen':
        title = `Aanvraag ${vergunningTitleLower} ontvangen`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${vergunning.zaaknummer} ontvangen.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished = vergunning.dateReceived ?? '';
        break;
      // B&B only
      case vergunning.status === 'Meer informatie nodig':
        title = `Aanvraag ${vergunningTitleLower}: meer informatie nodig`;
        description = `Wij hebben meer informatie en tijd nodig om uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${vergunning.zaaknummer} te behandelen.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished =
          vergunning.steps.find(
            (step) => step.status === 'Meer informatie nodig'
          )?.datePublished ?? '';
        break;
      // B&B + Vakantieverhuurvergunning
      case !!vergunning.result:
        title = `Aanvraag ${vergunningTitleLower} ${vergunning.result.toLowerCase()}`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${vergunning.zaaknummer} ${vergunning.result.toLowerCase()}.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished =
          (vergunning.dateDecision || vergunning.dateReceived) ?? '';
        break;
    }
  }

  return {
    id: `vergunning-${vergunning.id}-notification`,
    datePublished,
    thema: Themas.TOERISTISCHE_VERHUUR,
    title,
    description: description,
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
  const linkTo = AppRoutes.TOERISTISCHE_VERHUUR;

  return {
    id: `toeristiche-verhuur-registratie-${vergunning.registrationNumber}-notification`,
    datePublished,
    thema: Themas.TOERISTISCHE_VERHUUR,
    title,
    description,
    link: {
      to: linkTo,
      title: cta,
    },
  };
}

export async function fetchToeristischeVerhuurNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  compareDate?: Date
) {
  const TOERISTISCHE_VERHUUR = await fetchToeristischeVerhuur(
    requestID,
    authProfileAndToken
  );

  const compareToDate = compareDate || new Date();

  const vakantieverhuurVergunningen =
    TOERISTISCHE_VERHUUR.content.vakantieverhuurVergunningen ?? [];
  const vakantieverhuurVergunningNotifications =
    vakantieverhuurVergunningen.map((vergunning) =>
      createToeristischeVerhuurNotification(
        vergunning,
        vakantieverhuurVergunningen
      )
    );
  const bbVergunningen = TOERISTISCHE_VERHUUR.content.bbVergunningen ?? [];
  const vergunningNotifications = bbVergunningen.map((vergunning) =>
    createToeristischeVerhuurNotification(vergunning, bbVergunningen)
  );

  const registrationsNotifications =
    TOERISTISCHE_VERHUUR.content.lvvRegistraties?.map(
      createRegistratieNotification
    ) ?? [];

  const notifications = [
    ...vakantieverhuurVergunningNotifications,
    ...vergunningNotifications,
    ...registrationsNotifications,
  ];

  const actualNotifications = notifications.filter(
    (notification) =>
      !!notification.datePublished &&
      isRecentNotification(notification.datePublished, compareToDate)
  );

  return apiSuccessResult({
    notifications: actualNotifications,
  });
}
