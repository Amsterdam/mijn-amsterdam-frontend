import { Link, Paragraph } from '@amsterdam/design-system-react';
import { generatePath } from 'react-router-dom';

import { useJeugdThemaData } from './useJeugdThemaData';
import { WMOVoorzieningFrontend } from '../../../server/services/wmo/wmo-config-and-types';
import { LinkProps } from '../../../universal/types';
import { ExternalUrls } from '../../config/external-urls';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';
import { HistoricItemsMention, ZorgPageContentTop } from '../Zorg/Zorg';

// eslint-disable-next-line import/no-default-export
export default function JeugdThemaPagina() {
  const { isError, isLoading, regelingen, title, routes, tableConfig } =
    useJeugdThemaData();

  const pageContentTop = ZorgPageContentTop('Leerlingenvervoer');

  const linkListItems: LinkProps[] = [
    {
      to: ExternalUrls.LEERLINGENVERVOER_LEES_MEER,
      title: 'Lees hier meer over Leerlingenvervoer',
    },
  ];

  // RP TODO: Ga hier verder
  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, textNoContent, filter, maxItems, className },
    ]) => {
      return (
        <ThemaPaginaTable<WMOVoorzieningFrontend>
          key={kind}
          title={title}
          className={className}
          zaken={regelingen.filter(filter)}
          listPageRoute={generatePath(routes.listPage, {
            kind,
          })}
          displayProps={displayProps}
          textNoContent={textNoContent}
          maxItems={maxItems}
        />
      );
    }
  );

  return (
    <>
      <ThemaPagina
        title={title}
        pageContentTop={pageContentTop}
        linkListItems={linkListItems}
        pageContentMain={tables}
        isError={isError}
        isLoading={isLoading}
      />
      <HistoricItemsMention />
    </>
  );
}
