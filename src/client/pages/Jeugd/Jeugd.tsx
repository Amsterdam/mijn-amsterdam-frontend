import { Link, Paragraph } from '@amsterdam/design-system-react';
import { generatePath } from 'react-router-dom';

import { useJeugdThemaData } from './useJeugdThemaData';
import { WMOVoorzieningFrontend } from '../../../server/services/wmo/wmo-config-and-types';
import { LinkProps } from '../../../universal/types';
import { ExternalUrls } from '../../config/external-urls';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';
import { HistoricItemsMention } from '../Zorg/Zorg';

// eslint-disable-next-line import/no-default-export
export default function JeugdThemaPagina() {
  const { isError, isLoading, regelingen, title, routes, tableConfig } =
    useJeugdThemaData();

  // RP TODO: Page content top make generic? Zorg WMO, kinda same text?
  // The call link and number definitely.
  // The last paragraph has more but relevant text at Zorg WMO.
  const pageContentTop = (
    <Paragraph>
      Hieronder ziet u uw voorzieningen Leerlingenvervoer. Heeft u vragen of
      wilt u een wijziging doorgeven? Bel dan gratis de Wmo Helpdesk: 0800 0643
      (maandag tot en met vrijdag van 08.00 tot 18.00 uur)
      <Link rel="noreferrer" href="tel:08000643" variant="inline">
        0800 0643
      </Link>{' '}
      (maandag tot en met vrijdag van 08.00 tot 18.00 uur)
    </Paragraph>
  );

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
