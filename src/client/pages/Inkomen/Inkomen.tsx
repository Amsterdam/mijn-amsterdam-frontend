import { Paragraph } from '@amsterdam/design-system-react';

import { tableConfigSpecificaties } from './Inkomen-thema-config';
import { useInkomenThemaData } from './useInkomenThemaData.hook';
import { PageContentCell } from '../../components/Page/Page';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph>
      Op deze pagina vindt u informatie over uw uitkering en de ondersteuning
      die u krijgt omdat u weinig geld hebt.
    </Paragraph>
  </PageContentCell>
);

export function InkomenThemaPagina() {
  const {
    title,
    tableConfig,
    zaken,
    isLoadingWpi,
    isErrorWpi,
    isErrorWpiSpecificaties,
    isLoadingWpiSpecificaties,
    linkListItems,
    specificaties,
  } = useInkomenThemaData();

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
          zaken={specificaties}
          displayProps={displayProps}
          maxItems={maxItems}
        />
      );
    }
  );

  return (
    <ThemaPagina
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
