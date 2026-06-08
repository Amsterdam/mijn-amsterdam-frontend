import { Paragraph } from '@amsterdam/design-system-react';

import { ThemaPaginaTable } from '../../../../components/Thema/ThemaPaginaTable.tsx';
import {
  type ContactmomentFrontendFinal,
  tableConfigs,
  themaConfig,
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
            De lijst met contactmomenten wordt alleen bijgehouden met
            telefoongesprekken naar telefoonnummer 14 020 of chatberichten met
            een medewerker, waarbij er voor het beantwoorden van de vraag
            persoonsgegevens nodig zijn.
          </Paragraph>
          <Paragraph className="ams-mb-m">
            Brieven, klachten vanuit het klachtenformulier, WhatsApp- en
            socialmediaberichten staan niet in deze lijst.
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
      listPageRoute={themaConfig.listPageContactmomenten.route.path}
      title="Contactmomenten"
    />
  );
}
