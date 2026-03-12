import { Paragraph } from '@amsterdam/design-system-react';

import { useHorecaThemaData } from './useHorecaThemaData.hook.ts';
import type { HorecaVergunningFrontend } from '../../../../server/services/horeca/decos-zaken.ts';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph>
      Hier ziet u een overzicht van uw aanvragen voor Horeca en ontheffingen bij
      gemeente Amsterdam.
    </Paragraph>
  </PageContentCell>
);

export function HorecaThema() {
  const {
    themaId,
    themaTitle,
    tableConfig,
    vergunningen,
    isLoading,
    isError,
    themaConfig,
  } = useHorecaThemaData();
  useHTMLDocumentTitle(themaConfig.route);

  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, listPageRoute, maxItems }]) => {
      return (
        <ThemaPaginaTable<HorecaVergunningFrontend>
          key={kind}
          title={title}
          listPageRoute={listPageRoute}
          zaken={vergunningen.filter(filter)}
          displayProps={displayProps}
          maxItems={maxItems}
        />
      );
    }
  );

  return (
    <ThemaPagina
      id={themaId}
      title={themaTitle}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={tables}
      pageLinks={themaConfig.pageLinks}
      maintenanceNotificationsPageSlug="horeca"
    />
  );
}
