import { Heading, Paragraph } from '@amsterdam/design-system-react';

import type { ContactmomentProps } from './KlantContact-thema-config.ts';
import { useContactmomentenListData } from './useContactmomentenListData.hook.tsx';
import { useKlantcontactData } from './useKlantcontactData.hook.tsx';
import { AfspraakCards } from '../../../components/AfspraakCard/AfspraakCard.tsx';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel.tsx';
import { LinkToListPage } from '../../../components/LinkToListPage/LinkToListPage.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app.ts';
import { isEnabled } from '../../../config/feature-toggles.ts';
import { getRedactedClass } from '../../../helpers/cobrowse.ts';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function KlantContactThema() {
  const {
    id,
    title,
    isLoading,
    isError,
    dependencyErrors,
    pageLinks,
    routeConfig,
  } = useKlantcontactData();
  useHTMLDocumentTitle(routeConfig);

  const pageContentTop = <div></div>;

  const pageContentErrorAlert = (
    <>
      Wij kunnen de volgende gegevens nu niet tonen:
      <br />
      {dependencyErrors.afspraken && <>- Uw overzicht van uw afspraken</>}
      {dependencyErrors.contactmomenten && (
        <>- Uw overzicht van contactmomenten</>
      )}
    </>
  );

  return (
    <ThemaPagina
      id={id}
      title={title}
      isError={isError}
      isPartialError={
        dependencyErrors.afspraken !== dependencyErrors.contactmomenten
      }
      errorAlertContent={pageContentErrorAlert}
      isLoading={isLoading}
      pageLinks={pageLinks}
      pageContentTop={pageContentTop}
      pageContentMain={
        <>
          <Afspraken />
          <ContactMomenten />
        </>
      }
    />
  );
}

function Afspraken() {
  const { afspraken, themaConfig } = useKlantcontactData();

  if (!isEnabled('KLANT_CONTACT.afspraken')) {
    return null;
  }
  const MAX_AMOUNT_AFSPRAKEN_DISPLAYED = MAX_TABLE_ROWS_ON_THEMA_PAGINA;
  return (
    <PageContentCell className={getRedactedClass(null, 'full')}>
      <Heading level={2} className="ams-mb-s">
        Afspraken bij een stadsloket
      </Heading>
      {afspraken.length ? (
        <>
          <AfspraakCards
            afspraken={afspraken.slice(0, MAX_AMOUNT_AFSPRAKEN_DISPLAYED)}
          />
          <LinkToListPage
            count={afspraken.length}
            route={themaConfig.listPageAfspraken.route.path}
            threshold={MAX_AMOUNT_AFSPRAKEN_DISPLAYED}
          />
        </>
      ) : (
        <Paragraph>U heeft geen afspraken.</Paragraph>
      )}
    </PageContentCell>
  );
}

function ContactMomenten() {
  const { contactmomenten, tableConfig, routeConfig } =
    useContactmomentenListData();

  if (!contactmomenten.length) {
    return null;
  }
  return (
    <PageContentCell>
      <CollapsiblePanel title="Contactmomenten" startCollapsed={false}>
        <Paragraph className="ams-mb-m">
          De lijst met contactmomenten wordt alleen bijgehouden met
          telefoongesprekken naar telefoonnummer 14 020 of chatberichten met een
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
    </PageContentCell>
  );
}
