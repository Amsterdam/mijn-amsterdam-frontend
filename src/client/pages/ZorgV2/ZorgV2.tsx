import { Link, Paragraph } from '@amsterdam/design-system-react';
import { generatePath } from 'react-router-dom';
import { WMOVoorzieningFrontend } from '../../../server/services/wmo-v2/wmo-config-and-types';
import { LinkProps } from '../../../universal/types/App.types';
import { ExternalUrls } from '../../config/external-urls';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';
import { useZorgThemaData } from './useZorgThemaData';
import styles from './Zorg.module.scss';

export default function ThemaPaginaZorg() {
  const { isError, isLoading, regelingen, title, routes, tableConfig } =
    useZorgThemaData();

  const pageContentTop = (
    <Paragraph>
      Hieronder ziet u uw regelingen en hulpmiddelen vanuit de Wmo. Hebt u
      vragen of wilt u een wijziging doorgeven? Bel dan gratis de Wmo Helpdesk:{' '}
      <Link rel="noreferrer" href="tel:08000643" variant="inline">
        0800 0643
      </Link>
      . Of ga langs bij het Sociaal Loket.
    </Paragraph>
  );

  const linkListItems: LinkProps[] = [
    {
      to: ExternalUrls.ZORG_LEES_MEER,
      title: 'Lees hier meer over zorg en ondersteuning',
    },
    {
      to: ExternalUrls.ZORG_LEES_MEER,
      title: 'Documenten uploaden voor de Wmo',
    },
  ];

  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, sort, maxItems, className }]) => {
      return (
        <ThemaPaginaTable<WMOVoorzieningFrontend>
          key={kind}
          title={title}
          className={className}
          zaken={regelingen.filter(filter).sort(sort)}
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
        pageContentTables={tables}
        isError={isError}
        isLoading={isLoading}
      />
      <p className={styles.HistoricItemsMention}>
        U ziet hier alleen informatie vanaf 1 januari 2018. Bel voor informatie
        van eerdere jaren de Wmo Helpdesk: 0800 0643.
      </p>
    </>
  );
}
