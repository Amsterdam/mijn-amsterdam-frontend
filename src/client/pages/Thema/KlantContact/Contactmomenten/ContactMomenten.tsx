import { Heading, Paragraph } from '@amsterdam/design-system-react';

import type { ContactMomentFrontend } from './Contactmomenten-config.ts';
import type { useContactmomenten } from './useContactmomenten.tsx';
import ThemaPaginaTable from '../../../../components/Thema/ThemaPaginaTable.tsx';

export function ContactMomenten({
  contactmomentenData,
}: {
  contactmomentenData: ReturnType<typeof useContactmomenten>;
}) {
  const { contactmomenten, displayProps, title, listPageRoute } =
    contactmomentenData;

  if (!contactmomenten.length) {
    return null;
  }

  return (
    <>
      <Heading level={3}>{title}</Heading>
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
      <ThemaPaginaTable<ContactMomentFrontend>
        zaken={contactmomenten}
        displayProps={displayProps}
        listPageLinkTitle="Bekijk alle contactmomenten"
        listPageRoute={listPageRoute}
      />
    </>
  );
}
