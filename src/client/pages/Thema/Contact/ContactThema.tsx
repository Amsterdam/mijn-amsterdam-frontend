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
    <PageContentCell>
      <Paragraph className="ams-mb-m">Hallo.</Paragraph>
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
