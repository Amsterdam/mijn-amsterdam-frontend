import { Heading, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import type { ContactmomentProps } from './KlantContact-thema-config.ts';
import { useContactmomentenListData } from './useContactmomentenListData.hook.tsx';
import { useKlantcontactData } from './useKlantcontactData.hook.tsx';
import styles from '../../../components/AfspraakCard/AfspraakCard.module.scss';
import { AfspraakCard } from '../../../components/AfspraakCard/AfspraakCard.tsx';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { isEnabled } from '../../../config/feature-toggles.ts';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function KlantContactThema() {
  const {
    id,
    title,
    isLoading,
    isError,
    pageLinks,
    routeConfig,
    afspraken,
    contactmomenten,
  } = useKlantcontactData();
  useHTMLDocumentTitle(routeConfig);

  const pageContentTop = <div></div>;

  const pageContentErrorAlert = (
    <>
      Wij kunnen de volgende gegevens nu niet tonen:
      <br />
      {isError && <>- Uw overzicht van contactmomenten</>}
    </>
  );

  const afspraakCards = afspraken.map((afspraak) => {
    return (
      <AfspraakCard
        className={classNames('ams-mb-m', styles.CardListContainer)}
        key={afspraak.caseReference}
        afspraak={afspraak}
      ></AfspraakCard>
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
          {isEnabled('KLANT_CONTACT.afspraken') && (
            <PageContentCell>
              <Heading level={2} className="ams-mb-s">
                Afspraken bij een stadsloket
              </Heading>
              {afspraakCards.length ? (
                afspraakCards
              ) : (
                <Paragraph>U heeft geen afspraken.</Paragraph>
              )}
            </PageContentCell>
          )}
          {!!contactmomenten.length && (
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
