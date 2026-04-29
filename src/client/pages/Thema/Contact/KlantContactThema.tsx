import {
  Button,
  Heading,
  Icon,
  Paragraph,
} from '@amsterdam/design-system-react';
import { PersonAtDeskIcon } from '@amsterdam/design-system-react-icons';
import { generatePath } from 'react-router';

import type { ContactmomentProps } from './Contact-thema-config.ts';
import { useContactmomentenListData } from './useContactmomentenListData.hook.tsx';
import { useKlantcontactData } from './useKlantcontactData.hook.tsx';
import { Card } from '../../../components/Card/Card.tsx';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel.tsx';
import { MaLink, MaRouterLink } from '../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

import React, { type ReactNode } from 'react';

type ICALProps = {
  children?: ReactNode;
  // Format: use toICALDateTimeString(): YYYYMMDDTHHMMSSZ
  start: Date;
  end: Date;
  uid: string;
  summary: string;
  description: string;
  // Free form location field. Example: Amsterdam City Hall, Amstel 1, 1011 PN Amsterdam, Netherlands, Room 101
  location: string;
};

function leftPadWithZero(num: string): string {
  return num.length === 1 ? `0${num}` : num;
}

function toICALDateTimeString(date: Date): string {
  const year = date.getUTCFullYear().toString();
  const month = leftPadWithZero(date.getUTCMonth().toString());
  const day = leftPadWithZero(date.getUTCDate().toString());

  const hours = leftPadWithZero(date.getUTCHours().toString());
  const minutes = leftPadWithZero(date.getUTCMinutes().toString());
  const seconds = leftPadWithZero(date.getUTCSeconds().toString());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function LinkICAL({
  children,
  start,
  end,
  uid,
  summary,
  description,
  location,
}: ICALProps) {
  function handleDownload(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Amsterdam//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${toICALDateTimeString(new Date())}
DTSTART:${toICALDateTimeString(start)}
DTEND:${toICALDateTimeString(end)}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icalContent], {
      type: 'text/calendar;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'event.ics';

    // Trigger the download
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <a href="#" onClick={handleDownload}>
        {children}
      </a>
    </div>
  );
}

function setHourMinutes(date: Date, hourMinutes: string): void {
  const [hours, minutes] = hourMinutes.split(':');
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
}

export function KlantContactThema() {
  const {
    id,
    title,
    isLoading,
    isError,
    pageLinks,
    routeConfig,
    data,
    themaConfig,
  } = useKlantcontactData();
  useHTMLDocumentTitle(routeConfig);
  const pageContentErrorAlert = (
    <>
      Wij kunnen de volgende gegevens nu niet tonen:
      <br />
      {isError && <>- Uw overzicht van contactmomenten</>}
    </>
  );

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph>
        Hier regelt u uw contact voorkeuren, zoals wilt u de post van de
        gemeente alleen digitaal ontvangen, aanpassen van uw afspraken met de
        gemeente en het wijzigen van uw e-mailadres of telefoonnummer.
      </Paragraph>
    </PageContentCell>
  );

  const afspraakCards = data?.afspraken.map((a) => {
    const startTime = new Date(a.afspraakDate);
    setHourMinutes(startTime, a.startTime);
    const endTime = new Date(a.afspraakDate);
    setHourMinutes(endTime, a.endTime);
    return (
      <div key={a.caseReference}>
        <Card
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
          <LinkICAL
            start={startTime}
            end={endTime}
            uid={a.caseReference}
            summary={`Afspraak voor ${a.subject}`}
            description={`Referentienummer: ${a.caseReference}`}
            location={`Stadsloket ${a.location.name}, ${a.location.street}, ${a.location.postalCode} ${a.location.city}, Nederland`}
          >
            Voeg toe aan uw privé agenda
          </LinkICAL>
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
        </Card>
      </div>
    );
  });

  return (
    <ThemaPagina
      id={id}
      title={title}
      isError={isError}
      errorAlertContent={pageContentErrorAlert}
      isLoading={isLoading}
      pageLinks={pageLinks}
      pageContentTop={pageContentTop}
      pageContentMain={
        <>
          <PageContentCell>
            <Heading level={2} className="ams-mb-s">
              Afspraken bij een stadsloket
            </Heading>
            {afspraakCards ? (
              afspraakCards
            ) : (
              <Paragraph>U heeft geen afspraken.</Paragraph>
            )}
          </PageContentCell>
          {!!data?.contactmomenten.length && (
            <PageContentCell>
              <ContactMomenten />
            </PageContentCell>
          )}
        </>
      }
    />
  );
}

function ContactMomenten() {
  const { contactmomenten, tableConfig, routeConfig } =
    useContactmomentenListData();

  if (!contactmomenten.length) {
    return null;
  }

  return (
    <CollapsiblePanel title="Contactmomenten" startCollapsed={false}>
      <Paragraph className="ams-mb-m">
        De lijst met contactmomenten wordt alleen bijgehouden met telefonische
        gesprekken naar telefoonnummer 14 020 of chatberichten met een
        medewerker, waarbij er voor het beantwoorden van de vraag
        persoonsgegevens nodig zijn.
      </Paragraph>
      <Paragraph className="ams-mb-m">
        Brieven, klachten vanuit het klachtenformulier, WhatsApp- en
        socialmediaberichten staan niet in deze lijst.
      </Paragraph>
      <Paragraph className="ams-mb-m">
        Wilt u een eerder contactmoment doorgeven bij een volgende vraag? Geef
        dan het referentienummer door.
      </Paragraph>
      <ThemaPaginaTable<ContactmomentProps>
        zaken={contactmomenten}
        maxItems={tableConfig.maxItems}
        displayProps={tableConfig.displayProps}
        listPageLinkTitle="Bekijk alle contactmomenten"
        listPageRoute={routeConfig.path}
      />
    </CollapsiblePanel>
  );
}
