import { Paragraph } from '@amsterdam/design-system-react';

import { useKlachtenThemaData } from './useKlachtenThemaData.hook';
import { KlachtFrontend } from '../../../../server/services/klachten/types';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';
import { featureToggle } from './Klachten-thema-config';

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

  let tables = Object.values(tableConfig).map((conf) => {
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
  if (!featureToggle.statustreinAndAfgehandeldeMeldingenActive) {
    tables = tables.filter((table) => {
      return table.key !== 'Afgehandelde klachten';
    });
  }

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
