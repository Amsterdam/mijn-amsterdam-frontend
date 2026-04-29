import { useKlantcontactData } from './useKlantcontactData.hook.tsx';
import type { AfspraakFrontend } from '../../../../server/services/salesforce/klantcontact.types.ts';
import { generatePath } from 'react-router';

export type AfspraakFrontendFinal = {
  startDate: Date;
  endDate: Date;
  displayDate: string;
  qrCodeHref: string;
} & Omit<AfspraakFrontend, 'startDate' | 'endDate'>;

export function useAfsprakenListData() {
  const { data, themaConfig } = useKlantcontactData();

  const afspraken: AfspraakFrontendFinal[] = (data?.afspraken ?? []).map(
    (a) => {
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
    }
  );

  return { afspraken };
}
