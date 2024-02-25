import { subMonths } from 'date-fns';
import memoize from 'memoizee';
import { generatePath } from 'react-router-dom';
import { Themas, FeatureToggle } from '../../universal/config';
import { AppRoutes } from '../../universal/config/routes';
import {
  apiDependencyError,
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../universal/helpers/api';
import {
  calculateDaysBetweenDates,
  dateFormat,
  dateSort,
  isDateInPast,
} from '../../universal/helpers/date';
import {
  NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END,
  hasOtherActualVergunningOfSameType,
  isExpired,
  isNearEndDate,
} from '../../universal/helpers/vergunningen';
import { isRecentNotification } from '../../universal/helpers';
import { MyNotification } from '../../universal/types';
import { CaseType } from '../../universal/types/vergunningen';
import { DEFAULT_API_CACHE_TTL_MS, getApiConfig } from '../config';
import { requestData } from '../helpers';
import { AuthProfileAndToken } from '../helpers/app';
import { isAmsterdamAddress } from './buurt/helpers';
import {
  BBVergunning,
  VakantieverhuurVergunningaanvraag,
  Vergunning,
  fetchVergunningen,
  toeristischeVerhuurVergunningTypes,
} from './vergunningen/vergunningen';

export interface ToeristischeVerhuurRegistratieNumberSource {
  registrationNumber: string;
}

export interface ToeristischeVerhuurRegistratieDetailSource {
  rentalHouse: {
    city: string;
    houseLetter: string | null;
    houseNumber: string | null;
    houseNumberExtension: string | null;
    postalCode: string | null;
    street: string | null;
  };
  registrationNumber: string;
  agreementDate: string | null;
}

export interface ToeristischeVerhuurRegistratieDetail {
  city: string;
  houseLetter: string | null;
  houseNumber: string | null;
  houseNumberExtension: string | null;
  postalCode: string | null;
  registrationNumber: string;
  street: string | null;
  agreementDate: string | null;
}

export interface ToeristischeVerhuurRegistratieDetailsSourceData {
  content: ToeristischeVerhuurRegistratieDetail[];
}

export async function fetchRegistraties(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const url = `${process.env.BFF_LVV_API_URL}/bsn`;
  const registrationNumbersResponse = await requestData<string[]>(
    getApiConfig('TOERISTISCHE_VERHUUR_REGISTRATIES', {
      url,
      method: 'POST',
      data: JSON.stringify(authProfileAndToken.profile.id),
      transformResponse: (response) => {
        if (!Array.isArray(response)) {
          return [];
        }
        return response.map((r: ToeristischeVerhuurRegistratieNumberSource) =>
          r.registrationNumber.replaceAll(' ', '')
        );
      },
    }),
    requestID
  );

  if (registrationNumbersResponse.status !== 'OK') {
    return apiDependencyError({
      registrationNumbers: registrationNumbersResponse,
    });
  }

  const registrationDetailResponses = await Promise.all(
    registrationNumbersResponse.content?.map((num) => {
      const url = `${process.env.BFF_LVV_API_URL}/${num}`;
      return requestData<ToeristischeVerhuurRegistratieDetailSource>(
        getApiConfig('TOERISTISCHE_VERHUUR_REGISTRATIES', {
          method: 'get',
          url,
        }),
        requestID
      );
    }) || []
  );

  if (!registrationDetailResponses.every((r) => r.status === 'OK')) {
    return apiErrorResult('Could not retrieve all registration details', null);
  }

  const registrations: ToeristischeVerhuurRegistratieDetail[] =
    registrationDetailResponses
      .map((response) => response.content)
      .filter(
        (r): r is ToeristischeVerhuurRegistratieDetailSource =>
          r !== null && isAmsterdamAddress(r?.rentalHouse.city)
      )
      .map((r) => {
        const rUpdated: ToeristischeVerhuurRegistratieDetail = {
          ...r.rentalHouse,
          registrationNumber: r.registrationNumber,
          agreementDate: r.agreementDate,
        };
        return rUpdated as ToeristischeVerhuurRegistratieDetail;
      });

  return apiSuccessResult(registrations);
}

/** Code to transform and type Decos vergunningen to Toeristische verhuur */
interface ToeristischeVerhuurVergunningProps {
  isActual: boolean;
  duration: number;
}

// A union of the the source types that are retrieved from the Decos api
export type VakantieverhuurVergunning =
  | BBVergunning
  | VakantieverhuurVergunningaanvraag;

export type ToeristischeVerhuurVergunningaanvraag =
  VakantieverhuurVergunningaanvraag & ToeristischeVerhuurVergunningProps;

export type ToeristischeVerhuurBBVergunning = BBVergunning &
  ToeristischeVerhuurVergunningProps;

export type ToeristischeVerhuurVergunning =
  | ToeristischeVerhuurBBVergunning
  | ToeristischeVerhuurVergunningaanvraag;

export function transformVergunningenToVerhuur(
  vergunningen: VakantieverhuurVergunning[],
  dateCompare?: Date
): ToeristischeVerhuurVergunning[] {
  if (!Array.isArray(vergunningen)) {
    return [];
  }
  const vergunningenTransformed = vergunningen.map((vergunning) => {
    const isActual = vergunning.dateEnd
      ? !isDateInPast(vergunning.dateEnd, dateCompare)
      : true;

    let status = vergunning.status;

    // Add custom status for Vergunning vakantieverhuur only
    if (vergunning.title === 'Vergunning vakantieverhuur') {
      status = vergunning.decision;
      status = !isActual && status !== 'Ingetrokken' ? 'Verlopen' : status;
    } else if (
      vergunning.title === 'Vergunning bed & breakfast' &&
      vergunning.status === 'Afgehandeld'
    ) {
      status = vergunning.decision;
    }

    return {
      ...vergunning,
      status,
      isActual,
      duration:
        vergunning.dateEnd && vergunning.dateStart
          ? calculateDaysBetweenDates(vergunning.dateEnd, vergunning.dateStart)
          : 0,
    };
  });

  const overige: ToeristischeVerhuurVergunning[] = [];

  for (const vergunning of vergunningenTransformed) {
    // We consider expired B&B permits as not relevent for the user.
    if (
      vergunning.title === 'Vergunning bed & breakfast' &&
      !vergunning.isActual
    ) {
      continue;
    }
    overige.push(vergunning);
  }

  return [...overige.sort(dateSort('dateStart', 'desc'))];
}

interface BBResponseSource {}

const savedReportQueries: Record<
  string,
  (...params: any) => { data?: object; path: string }
> = {
  token: () => ({
    path: '/token',
    data: { apiKey: process.env.BFF_POWERBROWSER_API_KEY },
  }),
  persoonBSN: (bsn: string) => ({
    path: '/SearchRequest',
    data: {
      query: {
        tableName: 'PERSONEN',
        fieldNames: ['ID', 'BURGERSERVICENUMMER'],
        conditions: [
          {
            fieldName: 'BURGERSERVICENUMMER',
            fieldValue: bsn,
            operator: 0,
            dataType: 0,
          },
        ],
        limit: 1,
      },
      pageNumber: 0,
    },
  }),
  zakenPerPersoon: (persoonID: string) => ({
    path: '/Link/PERSONEN/GFO_ZAKEN/Table',
    data: [persoonID],
  }),
  zakenDetails: (ids: string) => ({
    path: `/Record/GFO_ZAKEN/${ids}`,
  }),
  vergunningenPerBSN: (bsn: string) => ({
    path: '/Report/RunSavedReport',
    data: {
      reportFileName:
        'D:\\Genetics\\PowerForms\\Overzichten\\Wonen\\MijnAmsterdamZaak.gov',
      Parameters: [
        {
          Name: 'BSN',
          Type: 'String',
          Value: {
            StringValue: bsn,
          },
          BeforeText: "'",
          AfterText: "'",
        },
      ],
    },
  }),
  vergunningStatussen: (zaakId: string) => ({
    path: '/Report/RunSavedReport',
    data: {
      reportFileName:
        'D:\\Genetics\\PowerForms\\Overzichten\\Wonen\\MijnAmsterdamStatus.gov',
      Parameters: [
        {
          Name: 'GFO_ZAKEN_ID',
          Type: 'String',
          Value: {
            StringValue: zaakId,
          },
        },
      ],
    },
  }),
};

function transformBBResponse(responseData: BBResponseSource) {
  // console.log('responseData', responseData);
  return responseData;
}

// zaak detail: record/GFO_ZAKEN/$id
// gelinkte dingen, bv documenten: link/GFO_ZAKEN/$id
// links: /record/GFO_ZAKEN/-999742/Links

async function fetchBBVergunning(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  profileType: ProfileType = 'private'
) {
  const dataRequestConfig = getApiConfig('POWERBROWSER', {
    transformResponse: transformBBResponse,
  });

  function fetchPowerBrowser<T>(
    query: keyof typeof savedReportQueries,
    dataParam?: string,
    token?: string
  ) {
    const { data, path } = savedReportQueries[query](dataParam);
    return requestData<T>(
      {
        ...dataRequestConfig,
        method: !data ? 'GET' : dataRequestConfig.method,
        url: `${dataRequestConfig.url}${path}`,
        data,
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      },
      requestID,
      authProfileAndToken
    );
  }

  const tokenResponse = await fetchPowerBrowser<string>('token');
  if (tokenResponse.status === 'OK' && authProfileAndToken.profile.id) {
    const token = tokenResponse.content;
    const persoonResponse = await fetchPowerBrowser<{ records: any[] }>(
      'persoonBSN',
      authProfileAndToken.profile.id,
      token
    );
    console.log(persoonResponse);
    if (persoonResponse.status === 'OK') {
      const gekppeldeZakenResponse = await fetchPowerBrowser<{
        records: Array<{
          id: string;
        }>;
      }>('zakenPerPersoon', persoonResponse.content.records[0].id, token);
      console.log(gekppeldeZakenResponse);
      if (gekppeldeZakenResponse.status === 'OK') {
        if (gekppeldeZakenResponse.content.records?.length) {
          const zakenRequests = gekppeldeZakenResponse.content.records.map(
            (record) =>
              fetchPowerBrowser<any[]>('zakenDetails', record.id, token)
          );
          const zakenResponse = await Promise.all(zakenRequests);

          const zaken = zakenResponse.map(
            (response) => response.content?.[0].theZaak
          );
          console.log(authProfileAndToken.profile.id, zaken);
          return apiSuccessResult(zaken);
        }
      }
      return gekppeldeZakenResponse;
    }
    return persoonResponse;
  }
  return tokenResponse;
}

async function fetchAndTransformToeristischeVerhuur(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  profileType: ProfileType = 'private'
) {
  if (!FeatureToggle.toeristischeVerhuurActive) {
    return apiSuccessResult({
      vergunningen: [],
      registraties: [],
    });
  }
  const registratiesRequest =
    profileType === 'commercial'
      ? Promise.resolve(apiSuccessResult([]))
      : fetchRegistraties(requestID, authProfileAndToken);

  const vergunningenRequest = fetchVergunningen(
    requestID,
    authProfileAndToken,
    {
      appRoute: (vergunning: Vergunning) => {
        switch (vergunning.caseType) {
          case CaseType.VakantieverhuurVergunningaanvraag:
            return AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/VV'];
          default:
            return AppRoutes['TOERISTISCHE_VERHUUR'];
        }
      },
      filter: (vergunning): vergunning is VakantieverhuurVergunning =>
        toeristischeVerhuurVergunningTypes.includes(vergunning.caseType),
    }
  );

  const bbRequest = fetchBBVergunning(
    requestID,
    authProfileAndToken,
    profileType
  );

  const [registratiesResponse, vergunningenResponse, bbResponse] =
    await Promise.allSettled([
      registratiesRequest,
      vergunningenRequest,
      bbRequest,
    ]);

  const registraties = getSettledResult(registratiesResponse);
  const vergunningen = getSettledResult(vergunningenResponse);
  const bbVergunning = getSettledResult(bbResponse);

  const toeristischeVerhuurVergunningen = transformVergunningenToVerhuur(
    vergunningen.content as VakantieverhuurVergunning[]
  );

  const failedDependencies = getFailedDependencies({
    registraties,
    vergunningen,
    bbVergunning,
  });

  return apiSuccessResult(
    {
      registraties: registraties.status === 'OK' ? registraties.content : [],
      vergunningen: toeristischeVerhuurVergunningen,
      bbVergunning: bbVergunning,
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
  item: ToeristischeVerhuurVergunning,
  items: ToeristischeVerhuurVergunning[]
): MyNotification {
  const vergunningTitleLower = item.title.toLowerCase();

  let title = `Aanvraag ${vergunningTitleLower} in behandeling`;
  let description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} in behandeling.`;
  let datePublished = item.dateRequest;
  let cta = 'Bekijk uw aanvraag';
  let linkTo: string = AppRoutes.TOERISTISCHE_VERHUUR;

  if (
    item.title === 'Vergunning bed & breakfast' ||
    item.title === 'Vergunning vakantieverhuur'
  ) {
    const ctaLinkToDetail = generatePath(
      AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
      {
        id: item.id,
      }
    );
    const ctaLinkToAanvragen =
      item.title === 'Vergunning bed & breakfast'
        ? 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/vergunning/'
        : 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/vergunning/';

    linkTo = ctaLinkToDetail;

    switch (true) {
      // B&B + Vakantieverhuurvergunning
      case item.decision === 'Verleend' &&
        isNearEndDate(item) &&
        !hasOtherActualVergunningOfSameType(items, item):
        title = `Uw ${vergunningTitleLower} loopt af`;
        description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} loopt binnenkort af. Vraag op tijd een nieuwe vergunning aan.`;
        cta = `Vergunning aanvragen`;
        linkTo = ctaLinkToAanvragen;
        datePublished = datePublished = dateFormat(
          subMonths(
            new Date(item.dateEnd!),
            NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END
          ),
          'yyyy-MM-dd'
        );
        break;
      // B&B + Vakantieverhuurvergunning
      case item.decision === 'Verleend' &&
        isExpired(item) &&
        !hasOtherActualVergunningOfSameType(items, item):
        title = `Uw ${vergunningTitleLower} is verlopen`;
        description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} is verlopen. U kunt een nieuwe vergunning aanvragen.`;
        cta = 'Vergunning aanvragen';
        linkTo = ctaLinkToAanvragen;
        datePublished = item.dateEnd!;
        break;
      // B&B only
      case item.status === 'Ontvangen':
        title = `Aanvraag ${vergunningTitleLower} ontvangen`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} ontvangen.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished = item.dateRequest;
        break;
      case item.status === 'In behandeling':
        title = `Aanvraag ${vergunningTitleLower} in behandeling`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} in behandeling genomen.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished = item.dateRequest;
        if (item.caseType === CaseType.BBVergunning) {
          datePublished = item.dateWorkflowActive || item.dateRequest;
        }
        break;
      // B&B + Vakantieverhuurvergunning
      case !!item.decision:
        const decision = item.decision?.toLowerCase() || 'afgehandeld';
        title = `Aanvraag ${vergunningTitleLower} ${decision}`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} ${decision}.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished = item.dateDecision || item.dateRequest;
        break;
    }
  }

  return {
    id: `vergunning-${item.id}-notification`,
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

    const vergunningen = TOERISTISCHE_VERHUUR.content.vergunningen;
    const vergunningNotifications = vergunningen.map((vergunning) =>
      createToeristischeVerhuurNotification(vergunning, vergunningen)
    );

    const registrationsNotifications =
      TOERISTISCHE_VERHUUR.content.registraties.map(
        createRegistratieNotification
      );

    const notifications = [
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

  return apiDependencyError({ TOERISTISCHE_VERHUUR });
}
