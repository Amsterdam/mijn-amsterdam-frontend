import { Paragraph } from '@amsterdam/design-system-react';
import { generatePath } from 'react-router-dom';

import { useAVGData } from './useAVGData.hook';
import { AVGRequestFrontend } from '../../../server/services/avg/types';
import { AppRoutes } from '../../../universal/config/routes';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ZakenTable';

const pageContentTop = (
  <Paragraph>Hieronder ziet u een overzicht van uw AVG verzoeken.</Paragraph>
);

function AVG() {
  const { tableConfig, avgVerzoeken, isLoading, isError } = useAVGData();
  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, sort }]) => {
      return (
        <ThemaPaginaTable<AVGRequestFrontend>
          key={kind}
          title={title}
          zaken={avgVerzoeken.filter(filter).sort(sort)}
          listPageRoute={generatePath(AppRoutes['AVG/LIST'], {
            kind,
          })}
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
      linkListItems={[
        {
          to: 'https://www.amsterdam.nl/privacy/loket/',
          title: 'Loket persoonsgegevens gemeente Amsterdam',
        },
      ]}
    />
  );
}

export default AVG;
