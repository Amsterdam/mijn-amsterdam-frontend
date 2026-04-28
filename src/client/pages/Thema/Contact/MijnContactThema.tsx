import { Button, Heading, Paragraph } from '@amsterdam/design-system-react';
import { PersonAtDeskIcon } from '@amsterdam/design-system-react-icons';
import { generatePath } from 'react-router';

import type { ContactmomentFrontend } from './Contact-thema-config.ts';
import { useContactmomentenListData } from './useContactmomentenListData.hook.tsx';
import { useKlantcontactData } from './useKlantcontactData.hook.tsx';
import { Card } from '../../../components/Card/Card.tsx';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel.tsx';
import { MaLink, MaRouterLink } from '../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function MijnContactThema() {
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

  const appointmentCards = data?.appointments.map((a) => {
    return (
      <div>
        <Card
          icon={PersonAtDeskIcon}
          title={a.subject}
          actionRightside={
            <MaLink style={{ marginLeft: '50px' }} href={a.cancellationLink}>
              Annuleren
            </MaLink>
          }
        >
          <Paragraph>{`Datum, ${a.appointmentDateFormatted}, ${a.startTime}-${a.endTime} uur`}</Paragraph>
          <Paragraph>{`Locatie Stadsloket ${a.location.name}, ${a.location.street}`}</Paragraph>
          <Paragraph className="ams-mb-s">
            Voeg toe aan uw privé agenda
          </Paragraph>
          <MaRouterLink
            maVariant="noUnderline"
            href={generatePath(themaConfig.appointmentQRCode.route.path, {
              qrcode: a.qrCode,
            })}
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
            {appointmentCards ? (
              appointmentCards
            ) : (
              <Paragraph>U heeft geen afspraken.</Paragraph>
            )}
          </PageContentCell>
          {!!data?.klantcontacten.length && (
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
      <ThemaPaginaTable<ContactmomentFrontend>
        zaken={contactmomenten}
        maxItems={tableConfig.maxItems}
        displayProps={tableConfig.displayProps}
        listPageLinkTitle="Bekijk alle contactmomenten"
        listPageRoute={routeConfig.path}
      />
    </CollapsiblePanel>
  );
}
