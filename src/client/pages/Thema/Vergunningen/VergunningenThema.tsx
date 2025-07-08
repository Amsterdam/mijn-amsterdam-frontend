import { Alert, Paragraph } from '@amsterdam/design-system-react';

import { useVergunningenThemaData } from './useVergunningenThemaData.hook.ts';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types.ts';
import { MaRouterLink } from '../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';
import { routeConfig as routeConfigParkeren } from '../Parkeren/Parkeren-thema-config.ts';

export function VergunningenThema() {
  const {
    vergunningen,
    isLoading,
    isError,
    tableConfig,
    linkListItems,
    title,
    routeConfig,
    hasParkeervergunningen,
  } = useVergunningenThemaData();
  useHTMLDocumentTitle(routeConfig.themaPage);

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph className={hasParkeervergunningen ? 'ams-mb-s' : ''}>
        Hier ziet u een overzicht van uw aanvragen voor vergunningen en
        ontheffingen bij gemeente Amsterdam.
      </Paragraph>
      {hasParkeervergunningen && (
        <Alert heading="Parkeervergunningen?" headingLevel={4}>
          <Paragraph>
            <MaRouterLink href={routeConfigParkeren.themaPage.path}>
              Bekijk hier de vergunningen voor parkeren.
            </MaRouterLink>
          </Paragraph>
        </Alert>
      )}
    </PageContentCell>
  );

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, filter, sort, listPageRoute, maxItems },
    ]) => {
      return (
        <ThemaPaginaTable<VergunningFrontend>
          key={kind}
          title={title}
          zaken={vergunningen.filter(filter).sort(sort)}
          listPageRoute={listPageRoute}
          displayProps={displayProps}
          maxItems={maxItems}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={title}
      pageContentTop={pageContentTop}
      linkListItems={linkListItems}
      pageContentMain={tables}
      isError={isError}
      isLoading={isLoading}
    />
  );
}
