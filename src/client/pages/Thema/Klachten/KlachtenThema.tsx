import { Paragraph } from '@amsterdam/design-system-react';

import { useKlachtenThemaData } from './useKlachtenThemaData.hook';
import { KlachtFrontend } from '../../../../server/services/klachten/types';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph>
      Hier ziet u een overzicht van de klachten die U heeft ingediend bij
      gemeente Amsterdam.
    </Paragraph>
  </PageContentCell>
);

export function KlachtenThema() {
  const {
    themaId,
    themaTitle,
    tableConfig,
    klachten,
    isLoading,
    isError,
    linkListItems,
    routeConfig,
  } = useKlachtenThemaData();
  useHTMLDocumentTitle(routeConfig.themaPage);

  console.log(klachten.sort((a, b) => (a.id > b.id ? -1 : 1)));

  const tables = Object.values(tableConfig).map((conf) => {
    return (
      <ThemaPaginaTable<KlachtFrontend>
        key={conf.title}
        title={conf.title}
        listPageRoute={conf.listPageRoute}
        zaken={klachten.filter(conf.filter)}
        displayProps={conf.displayProps}
        maxItems={conf.maxItems}
      />
    );
  });

  return (
    <ThemaPagina
      id={themaId}
      title={themaTitle}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={tables}
      linkListItems={linkListItems}
      maintenanceNotificationsPageSlug="klachten"
    />
  );
}
