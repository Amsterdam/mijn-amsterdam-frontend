import { Paragraph } from '@amsterdam/design-system-react';

import { ContactMomentFrontend } from './Contactmomenten.config';
import { useContactmomenten } from './useContactmomenten.hook';
import { AppRoutes } from '../../../../universal/config/routes';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel';
import { LinkToListPage } from '../../../components/LinkToListPage/LinkToListPage';
import { TableV2 } from '../../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app';

export function ContactMomenten() {
  const { contactmomenten, displayProps, title } = useContactmomenten();

  if (!contactmomenten.length) {
    return null;
  }

  return (
    <CollapsiblePanel title={title} startCollapsed={true}>
      <Paragraph className="ams-mb--sm">
        Dit is een overzicht van de momenten dat u contact had met gemeente
        Amsterdam. Dat zijn telefoontjes naar telefoonnummer 14 020, vragen
        vanuit het contactformulier en chatberichten via de website. In dit
        overzicht staan niet alle mogelijke contacten. Brieven, klachten vanuit
        het klachtenformulier, whatsappjes en social mediaberichten staan hier
        niet in.
      </Paragraph>
      <Paragraph className="ams-mb--md">
        Wilt u een eerder contactmoment doorgeven bij een volgende vraag? Geef
        dan het referentienummer door.
      </Paragraph>
      <TableV2<ContactMomentFrontend>
        items={contactmomenten.slice(0, MAX_TABLE_ROWS_ON_THEMA_PAGINA)}
        displayProps={displayProps}
      />
      {contactmomenten.length > MAX_TABLE_ROWS_ON_THEMA_PAGINA && (
        <LinkToListPage
          count={contactmomenten.length}
          route={AppRoutes['KLANT_CONTACT/CONTACTMOMENTEN']}
        />
      )}
    </CollapsiblePanel>
  );
}
