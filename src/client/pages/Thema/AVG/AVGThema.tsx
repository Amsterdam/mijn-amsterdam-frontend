import { Paragraph } from '@amsterdam/design-system-react';

import { useAVGData } from './useAVGData.hook.tsx';
import { AVGRequestFrontend } from '../../../../server/services/avg/types.ts';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph>Hieronder ziet u een overzicht van uw AVG verzoeken.</Paragraph>
  </PageContentCell>
);

export function AVGThema() {
  const {
    tableConfig,
    avgVerzoeken,
    isLoading,
    isError,
    linkListItems,
    title,
    routeConfig,
  } = useAVGData();
  useHTMLDocumentTitle(routeConfig.themaPage);

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, filter, sort, maxItems, listPageRoute },
    ]) => {
      return (
        <ThemaPaginaTable<AVGRequestFrontend>
          key={kind}
          title={title}
          listPageRoute={listPageRoute}
          zaken={avgVerzoeken.filter(filter).sort(sort)}
          displayProps={displayProps}
          maxItems={maxItems}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={title}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={tables}
      linkListItems={linkListItems}
    />
  );
}
