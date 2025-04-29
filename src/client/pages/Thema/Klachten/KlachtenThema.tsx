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
    themaTitle,
    tableConfig,
    klachten,
    isLoading,
    isError,
    linkListItems,
    routeConfig,
  } = useKlachtenThemaData();
  useHTMLDocumentTitle(routeConfig.themaPage);

  return (
    <ThemaPagina
      title={themaTitle}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={
        <ThemaPaginaTable<KlachtFrontend>
          title={tableConfig.title}
          listPageRoute={tableConfig.listPageRoute}
          zaken={klachten}
          displayProps={tableConfig.displayProps}
          maxItems={tableConfig.maxItems}
        />
      }
      linkListItems={linkListItems}
    />
  );
}
