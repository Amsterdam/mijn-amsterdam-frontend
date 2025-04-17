import { Paragraph } from '@amsterdam/design-system-react';

import { ContactMomentFrontend } from './Contactmomenten.config';
import { useContactmomenten } from './useContactmomenten.hook';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';

export function ContactMomenten() {
  const { contactmomenten, displayProps, title, routes } = useContactmomenten();

  if (!contactmomenten.length) {
    return null;
  }

  return (
    <CollapsiblePanel title={title} startCollapsed={true}>
      <Paragraph className="ams-mb--sm">
        De lijst met contactmomenten wordt alleen bijgehouden met telefonische
        gesprekken naar telefoonnummer 14 020 of chatberichten met een
        medewerker, waarbij er voor het beantwoorden van de vraag
        persoonsgegevens nodig zijn.
      </Paragraph>
      <Paragraph className="ams-mb--sm">
        Brieven, klachten vanuit het klachtenformulier, WhatsApp- en
        socialmediaberichten staan niet in deze lijst.
      </Paragraph>
      <Paragraph className="ams-mb--sm">
        Wilt u een eerder contactmoment doorgeven bij een volgende vraag? Geef
        dan het referentienummer door.
      </Paragraph>
      <ThemaPaginaTable<ContactMomentFrontend>
        zaken={contactmomenten}
        displayProps={displayProps}
        listPageLinkTitle="Bekijk alle contactmomenten"
        listPageRoute={routes.listPage}
      />
    </CollapsiblePanel>
  );
}
