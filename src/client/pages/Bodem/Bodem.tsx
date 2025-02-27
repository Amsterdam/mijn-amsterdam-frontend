import { Paragraph } from '@amsterdam/design-system-react';

import { useBodemData } from './useBodemData.hook';
import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export function Bodem() {
  const { items, tableConfig, isLoading, isError, linkListItems } =
    useBodemData();

  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, sort, listPageRoute }]) => {
      return (
        <ThemaPaginaTable<LoodMetingFrontend>
          key={kind}
          title={title}
          zaken={items.filter(filter).sort(sort)}
          listPageRoute={listPageRoute}
          displayProps={displayProps}
          textNoContent={`U heeft geen ${title.toLowerCase()}`}
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
        <Paragraph>
          Op deze pagina vindt u informatie over uw lood in de bodem-check.
        </Paragraph>
      }
      pageContentMain={tables}
      isPartialError={false}
      linkListItems={linkListItems}
    />
  );
}
