import { generatePath } from 'react-router-dom';

import { useBodemData } from './useBodemData.hook';
import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { AppRoutes } from '../../../universal/config/routes';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export default function Bodem() {
  const { items, tableConfig, isLoading, isError } = useBodemData();

  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, sort }]) => {
      return (
        <ThemaPaginaTable<LoodMetingFrontend>
          key={kind}
          title={title}
          zaken={items.filter(filter).sort(sort)}
          listPageRoute={generatePath(AppRoutes['BODEM/LIST'], {
            kind,
          })}
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
        <p>Op deze pagina vindt u informatie over uw lood in de bodem-check.</p>
      }
      pageContentMain={tables}
      isPartialError={false}
      linkListItems={[
        {
          title: 'Meer informatie over lood in de bodem.',
          to: 'https://www.amsterdam.nl/wonen-leefomgeving/bodem/lood-grond/',
        },
      ]}
    />
  );
}
