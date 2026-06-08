import { Paragraph } from '@amsterdam/design-system-react';

import { Afspraken } from './Afspraken/AfsprakenList.tsx';
import { CommunicatieVoorkeuren } from './Communicatievoorkeuren/CommunicatieVoorkeuren.tsx';
import { ContactMomenten } from './Contactmomenten/ContactmomentenTable.tsx';
import { useKlantcontactData } from './useKlantcontactData.hook.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { ThemaPagina } from '../../../components/Thema/ThemaPagina.tsx';
import { getRedactedClass } from '../../../helpers/cobrowse.ts';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function KlantContactThema() {
  const {
    themaConfig,
    isLoading,
    isError,
    dependencyErrors,
    communicatievoorkeuren,
    afspraken,
    contactmomenten,
  } = useKlantcontactData();

  const routeConfig = themaConfig.route;
  useHTMLDocumentTitle(routeConfig);

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph>
        Wij registreren uw afspraken bij een stadsloket, uw contactmomenten en
        uw communicatievoorkeuren. Zo kunnen we u beter van dienst zijn.
        Hieronder vindt u een overzicht van deze gegevens.
      </Paragraph>
    </PageContentCell>
  );

  const isPartialError =
    dependencyErrors.afspraken ||
    dependencyErrors.contactmomenten ||
    dependencyErrors.communicatievoorkeuren;

  const pageContentErrorAlert = (
    <>
      Wij kunnen de volgende gegevens nu niet tonen:
      <br />
      {dependencyErrors.afspraken && <>- Uw overzicht van afspraken</>}
      {dependencyErrors.contactmomenten && (
        <>- Uw overzicht van contactmomenten</>
      )}
      {dependencyErrors.communicatievoorkeuren && (
        <>- Uw overzicht van communicatievoorkeuren</>
      )}
    </>
  );

  return (
    <ThemaPagina
      id={themaConfig.id}
      title={themaConfig.title}
      pageContentTop={pageContentTop}
      pageLinks={themaConfig.pageLinks}
      isPartialError={isPartialError}
      errorAlertContent={pageContentErrorAlert}
      pageContentMain={
        <>
          {!!afspraken.length && (
            <PageContentCell
              spanWide={9}
              className={getRedactedClass(null, 'full')}
            >
              <Afspraken afspraken={afspraken} />
            </PageContentCell>
          )}
          {communicatievoorkeuren !== null && (
            <PageContentCell
              spanWide={8}
              className={getRedactedClass(null, 'full')}
            >
              <CommunicatieVoorkeuren
                standaardContactgegevens={
                  communicatievoorkeuren?.standaardContactgegevens
                }
                aangeslotenDiensten={
                  communicatievoorkeuren?.aangeslotenDiensten
                }
              />
            </PageContentCell>
          )}
          <ContactMomenten contactmomenten={contactmomenten} />
        </>
      }
      isError={!isPartialError && isError}
      isLoading={isLoading}
    />
  );
}
