import { Paragraph } from '@amsterdam/design-system-react';

import { useBodemData } from './useBodemData.hook';
import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { PageContentCell } from '../../components/Page/Page';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export function Bodem() {
  const { items, tableConfig, isLoading, isError, linkListItems } =
    useBodemData();

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, filter, sort, listPageRoute, maxItems },
    ]) => {
      return (
        <ThemaPaginaTable<LoodMetingFrontend>
          key={kind}
          title={title}
          zaken={items.filter(filter).sort(sort)}
          listPageRoute={listPageRoute}
          displayProps={displayProps}
          textNoContent={`U heeft geen ${title.toLowerCase()}`}
          maxItems={maxItems}
        />
      );
    }
  );
  return (
    <ThemaPagina
      title={ThemaTitles.BODEM}
      isLoading={isLoading}
      isError={isError}
      pageContentTop={
        <PageContentCell spanWide={6}>
          <Paragraph>
            Op deze pagina vindt u informatie over uw lood in de bodem-check.
          </Paragraph>
        </PageContentCell>
      }
      pageContentMain={tables}
      linkListItems={linkListItems}
    />
  );
}
