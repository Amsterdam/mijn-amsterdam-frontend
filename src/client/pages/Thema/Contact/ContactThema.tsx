import { Paragraph } from '@amsterdam/design-system-react';

import { CommunicatieVoorkeuren } from './Communicatievoorkeuren/CommunicatieVoorkeuren';
import { linkListItems } from './Contact-thema-config';
import { ContactMomenten } from './Contactmomenten/ContactMomenten';
import { useContactThema } from './useContactThema';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function ContactThemaPagina() {
  const { id, title, routeConfig, isError, isLoading } = useContactThema();
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
      linkListItems={linkListItems}
      pageContentMain={
        <>
          <PageContentCell spanWide={8}>
            <CommunicatieVoorkeuren />
          </PageContentCell>
          <PageContentCell>
            <ContactMomenten
              listPageRoute={routeConfig.listPageContactmomenten.path}
              showTitle
            />
          </PageContentCell>
        </>
      }
      isError={isError}
      isLoading={isLoading}
    />
  );
}
