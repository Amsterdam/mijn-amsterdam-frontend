import { Paragraph } from '@amsterdam/design-system-react';

import { useAVGData } from './useAVGData.hook.tsx';
import type { AVGRequestFrontend } from '../../../../server/services/avg/types.ts';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { ThemaPagina } from '../../../components/Thema/ThemaPagina.tsx';
import { ThemaPaginaZaken } from '../../../components/Thema/ThemaPaginaZaken.tsx';
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
    id,
    title,
    themaConfig,
  } = useAVGData();
  useHTMLDocumentTitle(themaConfig.route);

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, filter, sort, maxItems, listPageRoute },
    ]) => {
      return (
        <ThemaPaginaZaken<AVGRequestFrontend>
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
      id={id}
      title={title}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={tables}
      pageLinks={themaConfig.pageLinks}
      maintenanceNotificationsPageSlug="avg"
    />
  );
}
