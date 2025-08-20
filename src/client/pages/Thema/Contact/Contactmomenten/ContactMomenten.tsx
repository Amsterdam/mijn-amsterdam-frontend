import { Paragraph } from '@amsterdam/design-system-react';

import type { ContactMomentFrontend } from '../Contact-thema-config';
import { useContactmomenten } from './useContactmomenten';
import { CollapsiblePanel } from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import ThemaPaginaTable from '../../../../components/Thema/ThemaPaginaTable';

function ContactMomentenContent() {
  return (
    <>
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
    </>
  );
}

type ContactMomentenProps = {
  showTitle: boolean;
  listPageRoute: string;
};

export function ContactMomenten({
  showTitle = true,
  listPageRoute,
}: ContactMomentenProps) {
  const { contactmomenten, displayProps, title } = useContactmomenten();

  return (
    <ThemaPaginaTable<ContactMomentFrontend>
      title={showTitle ? title : undefined}
      subTitle={<ContactMomentenContent />}
      zaken={contactmomenten}
      displayProps={displayProps}
      listPageLinkTitle="Bekijk alle contactmomenten"
      listPageRoute={listPageRoute}
    />
  );
}

export function ContactMomentenCollapsiblePanel({
  listPageRoute,
}: ContactMomentenProps) {
  const { contactmomenten, title } = useContactmomenten();

  if (!contactmomenten.length) {
    return null;
  }

  return (
    <CollapsiblePanel title={title} startCollapsed={true}>
      <ContactMomenten showTitle={false} listPageRoute={listPageRoute} />
    </CollapsiblePanel>
  );
}
