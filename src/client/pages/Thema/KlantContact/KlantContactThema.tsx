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
        Wilt u uw post voortaan per e-mail ontvangen? Of wilt u op de hoogte
        gehouden worden van de status van uw zaak per sms?
      </Paragraph>
      <Paragraph>
        In dit onderdeel kunt u uw communicatievoorkeuren instellen en bekijken
        wanneer wij contact met u hebben gehad.
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
