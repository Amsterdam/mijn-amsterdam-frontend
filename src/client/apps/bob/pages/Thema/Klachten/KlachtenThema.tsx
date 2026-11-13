import { Paragraph } from '@amsterdam/design-system-react';

import type { KlachtFrontend } from '../../../../../../server/services/klachten/types.ts';
import { PageContentCell } from '../../../../../components/Page/Page.tsx';
import { ThemaPagina } from '../../../../../components/Thema/ThemaPagina.tsx';
import { ThemaPaginaDataView } from '../../../../../components/Thema/ThemaPaginaDataView.tsx';
import { useHTMLDocumentTitle } from '../../../../../hooks/useHTMLDocumentTitle.ts';
import { useKlachtenThemaData } from './useKlachtenThemaData.hook.ts';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph>
      Hier vindt u een overzicht van de klachten die u via het online formulier
      met DigiD hebt ingediend bij gemeente Amsterdam. Klachten die u
      telefonisch of zonder DigiD hebt ingediend, zijn hier niet zichtbaar.
    </Paragraph>
  </PageContentCell>
);

export function KlachtenThema() {
  const {
    themaId,
    title,
    tableConfig,
    klachten,
    isLoading,
    isError,
    themaConfig,
    pageLinks,
  } = useKlachtenThemaData();
  useHTMLDocumentTitle(themaConfig.route);

  const tables = Object.values(tableConfig).map((conf) => {
    return (
      <ThemaPaginaDataView<KlachtFrontend>
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
      title={title}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={tables}
      pageLinks={pageLinks}
    />
  );
}
