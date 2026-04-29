import { PersonAtDeskIcon } from '@amsterdam/design-system-react-icons';
import { useKlantcontactData } from './useKlantcontactData.hook.tsx';
import { AfspraakCard } from '../../../components/AfspraakCard/AfspraakCard.tsx';
import { Button, Icon, Paragraph } from '@amsterdam/design-system-react';
import { MaLink, MaRouterLink } from '../../../components/MaLink/MaLink.tsx';
import { generatePath } from 'react-router';
import { CalendarLink } from '../../../components/CalendarLink/CalendarLink.tsx';

function setHourMinutes(date: Date, hourMinutes: string): void {
  const [hours, minutes] = hourMinutes.split(':');
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
}

export function useAfsprakenListData() {
  const { data, themaConfig } = useKlantcontactData();

  const afspraakCards = data?.afspraken.map((a) => {
    const startTime = new Date(a.afspraakDate);
    setHourMinutes(startTime, a.startTime);
    const endTime = new Date(a.afspraakDate);
    setHourMinutes(endTime, a.endTime);
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
          <Paragraph>{`Datum, ${a.afspraakDateFormatted}, ${a.startTime}-${a.endTime} uur`}</Paragraph>
          <Paragraph>{`Locatie Stadsloket ${a.location.name}, ${a.location.street}`}</Paragraph>
          <CalendarLink
            className={'ams-mb-s'}
            start={startTime}
            end={endTime}
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

  return { afspraakCards };
}
