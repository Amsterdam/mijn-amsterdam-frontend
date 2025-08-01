import { Paragraph } from '@amsterdam/design-system-react';

import { tableConfigSpecificaties } from './Inkomen-thema-config';
import { useInkomenThemaData } from './useInkomenThemaData.hook';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph>
      Op deze pagina vindt u informatie over uw uitkering en de ondersteuning
      die u krijgt omdat u weinig geld hebt.
    </Paragraph>
  </PageContentCell>
);

export function InkomenThema() {
  const {
    id,
    title,
    tableConfig,
    zaken,
    isLoadingWpi,
    isErrorWpi,
    isErrorWpiSpecificaties,
    isLoadingWpiSpecificaties,
    linkListItems,
    specificaties,
    jaaropgaven,
    routeConfig,
  } = useInkomenThemaData();
  useHTMLDocumentTitle(routeConfig.themaPage);

  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, listPageRoute, maxItems }]) => {
      return (
        <ThemaPaginaTable
          key={kind}
          title={title}
          listPageRoute={listPageRoute}
          zaken={zaken.filter(filter)}
          displayProps={displayProps}
          maxItems={maxItems}
        />
      );
    }
  );

  const tablesSpecificaties = Object.entries(tableConfigSpecificaties).map(
    ([kind, { title, displayProps, listPageRoute, maxItems }]) => {
      return (
        <ThemaPaginaTable
          key={kind}
          title={title}
          listPageRoute={listPageRoute}
          zaken={kind === 'jaaropgaven' ? jaaropgaven : specificaties}
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
      isError={isErrorWpi || isErrorWpiSpecificaties}
      isLoading={isLoadingWpi || isLoadingWpiSpecificaties}
      pageContentTop={pageContentTop}
      pageContentMain={
        <>
          {tables}
          {tablesSpecificaties}
        </>
      }
      linkListItems={linkListItems}
    />
  );
}
