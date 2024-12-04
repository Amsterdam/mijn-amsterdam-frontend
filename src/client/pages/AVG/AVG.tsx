import { Paragraph } from '@amsterdam/design-system-react';

import { useAVGData } from './useAVGData.hook';
import { AVGRequestFrontend } from '../../../server/services/avg/types';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <Paragraph>Hieronder ziet u een overzicht van uw AVG verzoeken.</Paragraph>
);

function AVG() {
  const { tableConfig, avgVerzoeken, isLoading, isError, linkListItems } =
    useAVGData();
  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, sort, listPageRoute }]) => {
      return (
        <ThemaPaginaTable<AVGRequestFrontend>
          key={kind}
          title={title}
          zaken={avgVerzoeken.filter(filter).sort(sort)}
          listPageRoute={listPageRoute}
          displayProps={displayProps}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={ThemaTitles.AVG}
      isError={isError}
      isPartialError={false}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={tables}
      linkListItems={linkListItems}
    />
  );
}

export { AVG };
