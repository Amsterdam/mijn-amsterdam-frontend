import { Paragraph } from '@amsterdam/design-system-react';

import { ThemaPaginaTable } from '../../../../components/Thema/ThemaPaginaTable.tsx';
import {
  type ContactmomentFrontendFinal,
  tableConfigs,
} from '../KlantContact-thema-config.ts';

export function ContactMomenten({
  contactmomenten,
}: {
  contactmomenten: ContactmomentFrontendFinal[];
}) {
  return (
    <ThemaPaginaTable<ContactmomentFrontendFinal>
      contentAfterTheTitle={
        <>
          <Paragraph className="ams-mb-m">
            We bewaren alleen een overzicht van uw contact met ons als:
          </Paragraph>
          <ul className="ams-mb-m">
            <li>u een afspraak maakt bij het Stadsloket.</li>
            <li>u belt naar 14 020.</li>
            <li>u chat met een medewerker.</li>
          </ul>
          <Paragraph className="ams-mb-m">
            Dit doen we alleen als we uw persoonsgegevens nodig hebben om uw
            vraag te beantwoorden. Brieven, klachten vanuit het
            klachtenformulier, WhatsApp- en socialmediaberichten staan niet in
            deze lijst.
          </Paragraph>
          <Paragraph className="ams-mb-m">
            Wilt u een eerder contactmoment doorgeven bij een volgende vraag?
            Geef dan het referentienummer door.
          </Paragraph>
        </>
      }
      zaken={contactmomenten}
      maxItems={tableConfigs.contactmomenten.maxItems}
      displayProps={tableConfigs.contactmomenten.displayProps}
      listPageLinkTitle="Bekijk alle contactmomenten"
      listPageRoute={tableConfigs.contactmomenten.listPageRoute}
      title="Contactmomenten"
    />
  );
}
