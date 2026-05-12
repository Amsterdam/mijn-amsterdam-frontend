import { Paragraph } from '@amsterdam/design-system-react';

import { CommunicatieVoorkeuren } from './Communicatievoorkeuren/CommunicatieVoorkeuren.tsx';
import { useCommunicatievoorkeuren } from './Communicatievoorkeuren/useCommunicatieVoorkeuren.tsx';
import { ContactMomenten } from './Contactmomenten/ContactMomenten.tsx';
import { useContactmomenten } from './Contactmomenten/useContactmomenten.tsx';
import { linkListItems } from './KlantContact-thema-config.ts';
import { useContactThema } from './useKlantContactThema.ts';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function KlantContactThemaPagina() {
  const { id, title, routeConfig, isError, isLoading } = useContactThema();
  const communicatievoorkeuren = useCommunicatievoorkeuren();
  const contactmomenten = useContactmomenten();

  useHTMLDocumentTitle(routeConfig.themaPage);

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph className="ams-mb-m">
        Hier regelt u uw contact voorkeuren, zoals wilt u de post van de
        gemeente alleen digitaal ontvangen, aanpassen van uw afspraken met de
        gemeente en het wijzigen van uw e-mailadres of telefoonnummer.
      </Paragraph>
    </PageContentCell>
  );

  return (
    <ThemaPagina
      id={id}
      title={title}
      pageContentTop={pageContentTop}
      pageLinks={linkListItems}
      pageContentMain={
        <>
          <PageContentCell spanWide={8}>
            <CommunicatieVoorkeuren
              communicatievoorkeurenData={communicatievoorkeuren}
            />
          </PageContentCell>
          <PageContentCell>
            <ContactMomenten contactmomentenData={contactmomenten} />
          </PageContentCell>
        </>
      }
      isError={
        isError || contactmomenten.isError || communicatievoorkeuren.isError
      }
      isLoading={
        isLoading ||
        contactmomenten.isLoading ||
        communicatievoorkeuren.isLoading
      }
    />
  );
}
