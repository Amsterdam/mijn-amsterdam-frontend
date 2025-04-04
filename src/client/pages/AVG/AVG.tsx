import { Paragraph } from '@amsterdam/design-system-react';

import { useAVGData } from './useAVGData.hook';
import { AVGRequestFrontend } from '../../../server/services/avg/types';
import { PageContentCell } from '../../components/Page/Page';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph>Hieronder ziet u een overzicht van uw AVG verzoeken.</Paragraph>
  </PageContentCell>
);

function AVG() {
  const { tableConfig, avgVerzoeken, isLoading, isError, linkListItems } =
    useAVGData();

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
      title={ThemaTitles.AVG}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={tables}
      linkListItems={linkListItems}
    />
  );
}

export { AVG };
