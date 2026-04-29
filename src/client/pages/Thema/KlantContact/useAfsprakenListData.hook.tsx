import { PersonAtDeskIcon } from '@amsterdam/design-system-react-icons';
import { useKlantcontactData } from './useKlantcontactData.hook.tsx';
import { AfspraakCard } from '../../../components/AfspraakCard/AfspraakCard.tsx';
import { Button, Icon, Paragraph } from '@amsterdam/design-system-react';
import { MaLink, MaRouterLink } from '../../../components/MaLink/MaLink.tsx';
import { generatePath } from 'react-router';
import { CalendarLink } from '../../../components/CalendarLink/CalendarLink.tsx';

export function useAfsprakenListData() {
  const { id, data, themaConfig } = useKlantcontactData();

  const afspraken = (data?.afspraken ?? []).map((a) => {
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
    };
  });

  const afspraakCards = afspraken.map((a) => {
    return (
      <div key={a.caseReference}>
        <AfspraakCard
          icon={<Icon svg={PersonAtDeskIcon} size="heading-2"></Icon>}
          title={a.subject}
          actionRightside={
            <MaLink style={{ marginLeft: '50px' }} href={a.cancellationLink}>
              Annuleren
            </MaLink>
          }
        >
          <Paragraph>{a.displayDate}</Paragraph>
          <Paragraph>{`Locatie Stadsloket ${a.location.name}, ${a.location.street}`}</Paragraph>
          <CalendarLink
            className={'ams-mb-s'}
            start={a.startDate}
            end={a.endDate}
            uid={a.caseReference}
            summary={`Afspraak voor ${a.subject}`}
            description={`Referentienummer: ${a.caseReference}`}
            location={`Stadsloket ${a.location.name}, ${a.location.street}, ${a.location.postalCode} ${a.location.city}, Nederland`}
          >
            Voeg toe aan uw privé agenda
          </CalendarLink>
          <MaRouterLink
            maVariant="noUnderline"
            href={generatePath(
              themaConfig.detailPageAfspraakQRCode.route.path,
              {
                qrcode: a.qrCode,
              }
            )}
          >
            <Button variant="secondary">Toon QR code</Button>
          </MaRouterLink>
        </AfspraakCard>
      </div>
    );
  });

  return { id, afspraakCards, afspraken };
}
