import { generatePath, useParams } from 'react-router';

import { tableConfigs, themaConfig } from './KlantContact-thema-config.ts';
import type { AfspraakFrontend } from '../../../../server/services/salesforce/klantcontact.types.ts';
import {
  isLoading,
  isError,
  hasFailedDependency,
} from '../../../../universal/helpers/api.ts';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useKlantcontactData() {
  const { KLANT_CONTACT } = useAppStateGetter();
  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);
  const routeParams = useParams();

  return {
    themaConfig,
    id: themaConfig.id,
    title: themaConfig.title,
    contactmomenten: KLANT_CONTACT.content?.contactmomenten ?? [],
    get afspraken() {
      return getAfspraken(KLANT_CONTACT.content?.afspraken ?? []);
    },
    pageLinks: themaConfig.pageLinks,
    isError: isError(KLANT_CONTACT),
    isLoading: isLoading(KLANT_CONTACT),
    dependencyErrors: {
      contactmomenten: hasFailedDependency(KLANT_CONTACT, 'contactmomenten'),
      afspraken: hasFailedDependency(KLANT_CONTACT, 'afspraken'),
    },
    routeConfig: themaConfig.route,
    breadcrumbs,
    routeParams,
    tableConfigs,
    listPageRoute: generatePath(
      themaConfig.listPageContactmomenten.route.path,
      {
        page: null,
      }
    ),
  };
}

export type AfspraakFrontendFinal = {
  startDate: Date;
  endDate: Date;
  displayDate: string;
  qrCodeHref: string;
} & Omit<AfspraakFrontend, 'startDate' | 'endDate'>;

function getAfspraken(afspraken: AfspraakFrontend[]): AfspraakFrontendFinal[] {
  return afspraken.map((a) => {
    const start = new Date(a.startDate);
    const end = new Date(a.endDate);

    const pad = (num: number) => num.toString().padStart(2, '0');
    const formatToHoursMinutes = (date: Date) =>
      `${pad(date.getHours())}:${pad(date.getMinutes())}`;

    return {
      ...a,
      startDate: start,
      endDate: end,
      displayDate: `Datum, ${a.dateFormatted}, ${formatToHoursMinutes(start)}-${formatToHoursMinutes(end)} uur`,
      qrCodeHref: generatePath(
        themaConfig.detailPageAfspraakQRCode.route.path,
        {
          qrcode: a.qrCode,
        }
      ),
    };
  });
}
