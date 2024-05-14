import memoize from 'memoizee';
import { Chapters, FeatureToggle } from '../../../universal/config';
import { AppRoutes } from '../../../universal/config/routes';
import {
  apiDependencyError,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import { isActualNotification } from '../../../universal/helpers/vergunningen';
import { MyNotification } from '../../../universal/types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { BBVergunning, fetchBBVergunning } from './bb-vergunning';
import {
  ToeristischeVerhuurRegistratieDetail,
  fetchRegistraties,
} from './lvv-registratie';
import {
  VakantieverhuurVergunning,
  fetchVakantieverhuurVergunningen,
} from './vakantieverhuur-vergunning';

async function fetchAndTransformToeristischeVerhuur(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  profileType: ProfileType = 'private'
) {
  if (!FeatureToggle.toeristischeVerhuurActive) {
    return apiSuccessResult({
      vakantieverhuurVergunningen: [],
      bbVergunningen: [],
      lvvRegistraties: [],
    });
  }
  const lvvRegistratiesRequest =
    profileType === 'commercial'
      ? Promise.resolve(apiSuccessResult([]))
      : fetchRegistraties(requestID, authProfileAndToken);

  const bbVergunningenRequest = fetchBBVergunning(
    requestID,
    authProfileAndToken
  );

  const vakantieverhuurVergunningenRequest = fetchVakantieverhuurVergunningen(
    requestID,
    authProfileAndToken
  );

  const [
    lvvRegistratiesResponse,
    vakantieverhuurVergunningenResponse,
    bbVergunningenResponse,
  ] = await Promise.allSettled([
    lvvRegistratiesRequest,
    vakantieverhuurVergunningenRequest,
    bbVergunningenRequest,
  ]);

  const lvvRegistraties = getSettledResult(lvvRegistratiesResponse);

  const vakantieverhuurVergunningen = getSettledResult(
    vakantieverhuurVergunningenResponse
  );

  const bbVergunningen = getSettledResult(bbVergunningenResponse);

  const failedDependencies = getFailedDependencies({
    lvvRegistraties,
    vakantieverhuurVergunningen,
    bbVergunningen,
  });

  return apiSuccessResult(
    {
      lvvRegistraties: lvvRegistraties.content ?? [],
      vakantieverhuurVergunningen: vakantieverhuurVergunningen.content ?? [],
      bbVergunningen: bbVergunningen.content ?? [],
    },
    failedDependencies
  );
}

export const fetchToeristischeVerhuur = memoize(
  fetchAndTransformToeristischeVerhuur,
  {
    maxAge: DEFAULT_API_CACHE_TTL_MS,
    normalizer: function (args) {
      return args[0] + JSON.stringify(args[1]);
    },
  }
);

export function createToeristischeVerhuurNotification(
  item: BBVergunning | VakantieverhuurVergunning,
  items: Array<BBVergunning | VakantieverhuurVergunning>
): MyNotification {
  // const vergunningTitleLower = item.title.toLowerCase();

  // let title = `Aanvraag ${vergunningTitleLower} in behandeling`;
  // let description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} in behandeling.`;
  // let datePublished = item.dateRequest;
  // let cta = 'Bekijk uw aanvraag';
  // let linkTo: string = AppRoutes.TOERISTISCHE_VERHUUR;

  // if (
  //   item.title === 'Vergunning bed & breakfast' ||
  //   item.title === 'Vergunning vakantieverhuur'
  // ) {
  //   const ctaLinkToDetail = generatePath(
  //     AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
  //     {
  //       id: item.id,
  //     }
  //   );
  //   const ctaLinkToAanvragen =
  //     item.title === 'Vergunning bed & breakfast'
  //       ? 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/vergunning/'
  //       : 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/vergunning/';

  //   linkTo = ctaLinkToDetail;

  //   switch (true) {
  //     // B&B + Vakantieverhuurvergunning
  //     case item.decision === 'Verleend' &&
  //       isNearEndDate(item) &&
  //       !hasOtherActualVergunningOfSameType(items, item):
  //       title = `Uw ${vergunningTitleLower} loopt af`;
  //       description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} loopt binnenkort af. Vraag op tijd een nieuwe vergunning aan.`;
  //       cta = `Vergunning aanvragen`;
  //       linkTo = ctaLinkToAanvragen;
  //       datePublished = datePublished = dateFormat(
  //         subMonths(
  //           new Date(item.dateEnd!),
  //           NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END
  //         ),
  //         'yyyy-MM-dd'
  //       );
  //       break;
  //     // B&B + Vakantieverhuurvergunning
  //     case item.decision === 'Verleend' &&
  //       isExpired(item) &&
  //       !hasOtherActualVergunningOfSameType(items, item):
  //       title = `Uw ${vergunningTitleLower} is verlopen`;
  //       description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} is verlopen. U kunt een nieuwe vergunning aanvragen.`;
  //       cta = 'Vergunning aanvragen';
  //       linkTo = ctaLinkToAanvragen;
  //       datePublished = item.dateEnd!;
  //       break;
  //     // B&B only
  //     case item.status === 'Ontvangen':
  //       title = `Aanvraag ${vergunningTitleLower} ontvangen`;
  //       description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} ontvangen.`;
  //       cta = 'Bekijk uw aanvraag';
  //       linkTo = ctaLinkToDetail;
  //       datePublished = item.dateRequest;
  //       break;
  //     case item.status === 'In behandeling':
  //       title = `Aanvraag ${vergunningTitleLower} in behandeling`;
  //       description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} in behandeling genomen.`;
  //       cta = 'Bekijk uw aanvraag';
  //       linkTo = ctaLinkToDetail;
  //       datePublished = item.dateRequest;
  //       if (item.caseType === CaseType.BBVergunning) {
  //         datePublished = item.dateWorkflowActive || item.dateRequest;
  //       }
  //       break;
  //     // B&B + Vakantieverhuurvergunning
  //     case !!item.decision:
  //       const decision = item.decision?.toLowerCase() || 'afgehandeld';
  //       title = `Aanvraag ${vergunningTitleLower} ${decision}`;
  //       description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} ${decision}.`;
  //       cta = 'Bekijk uw aanvraag';
  //       linkTo = ctaLinkToDetail;
  //       datePublished = item.dateDecision || item.dateRequest;
  //       break;
  //   }
  // }

  // return {
  //   id: `vergunning-${item.id}-notification`,
  //   datePublished,
  //   chapter: Chapters.TOERISTISCHE_VERHUUR,
  //   title,
  //   description: description,
  //   link: {
  //     to: linkTo,
  //     title: cta,
  //   },
  // };
  return {} as MyNotification;
}

function createRegistratieNotification(
  item: ToeristischeVerhuurRegistratieDetail
): MyNotification {
  const title = 'Aanvraag landelijk registratienummer toeristische verhuur';
  const description = `Uw landelijke registratienummer voor toeristische verhuur is toegekend. Uw registratienummer is ${item.registrationNumber}.`;
  const datePublished = !!item.agreementDate ? item.agreementDate : '';
  const cta = 'Bekijk uw overzicht toeristische verhuur';
  const linkTo = AppRoutes.TOERISTISCHE_VERHUUR;

  return {
    id: `toeristiche-verhuur-registratie-${item.registrationNumber}-notification`,
    datePublished,
    chapter: Chapters.TOERISTISCHE_VERHUUR,
    title,
    description,
    link: {
      to: linkTo,
      title: cta,
    },
  };
}

export async function fetchToeristischeVerhuurNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  compareDate?: Date,
  profileType?: ProfileType
) {
  const TOERISTISCHE_VERHUUR = await fetchToeristischeVerhuur(
    requestID,
    authProfileAndToken,
    profileType
  );

  if (TOERISTISCHE_VERHUUR.status === 'OK') {
    const compareToDate = compareDate || new Date();

    const vergunningen =
      TOERISTISCHE_VERHUUR.content.vakantieverhuurVergunningen ?? [];
    const vergunningNotifications = vergunningen.map((vergunning) =>
      createToeristischeVerhuurNotification(vergunning, vergunningen)
    );

    const registrationsNotifications =
      TOERISTISCHE_VERHUUR.content.lvvRegistraties?.map(
        createRegistratieNotification
      ) ?? [];

    const notifications = [
      ...vergunningNotifications,
      ...registrationsNotifications,
    ];

    const actualNotifications = notifications.filter(
      (notification) =>
        !!notification.datePublished &&
        isActualNotification(notification.datePublished, compareToDate)
    );

    return apiSuccessResult({
      notifications: actualNotifications,
    });
  }

  return apiDependencyError({ TOERISTISCHE_VERHUUR });
}
