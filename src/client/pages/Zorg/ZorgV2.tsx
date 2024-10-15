import { Link, Paragraph } from '@amsterdam/design-system-react';
import { generatePath } from 'react-router-dom';

import { useZorgThemaData } from './useZorgThemaData';
import styles from './Zorg.module.scss';
import { WMOVoorzieningFrontend } from '../../../server/services/wmo/wmo-config-and-types';
import { LinkProps } from '../../../universal/types/App.types';
import { ExternalUrls } from '../../config/external-urls';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export default function ThemaPaginaZorg() {
  const { isError, isLoading, regelingen, title, routes, tableConfig } =
    useZorgThemaData();

  const pageContentTop = (
    <Paragraph>
      Hieronder ziet u uw voorzieningen vanuit de Wet maatschappelijke
      ondersteuning (Wmo). Heeft u vragen of wilt u een wijziging doorgeven? Bel
      dan gratis de Wmo Helpdesk:{' '}
      <Link rel="noreferrer" href="tel:08000643" variant="inline">
        0800 0643
      </Link>{' '}
      (maandag tot en met vrijdag van 08.00 tot 18.00 uur) of ga langs bij het
      Sociaal Loket.
    </Paragraph>
  );

  const linkListItems: LinkProps[] = [
    {
      to: ExternalUrls.ZORG_LEES_MEER,
      title: 'Lees hier meer over zorg en ondersteuning',
    },
  ];

  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, maxItems, className }]) => {
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
          textNoContent={`U heeft geen ${title.toLowerCase()}`}
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
      <p className={styles.HistoricItemsMention}>
        U ziet hier informatie vanaf 1 januari 2018. Wilt u iets weten van
        daarvoor? Bel dan de Wmo Helpdesk:{' '}
        <Link href="tel:08000643">0800 0643</Link>.
      </p>
    </>
  );
}
