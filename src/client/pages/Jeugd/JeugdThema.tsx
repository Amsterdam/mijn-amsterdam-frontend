import { Link, Paragraph } from '@amsterdam/design-system-react';

import { useJeugdThemaData } from './useJeugdThemaData';
import { LeerlingenvervoerVoorzieningFrontend } from '../../../server/services/jeugd/jeugd';
import { LinkProps } from '../../../universal/types';
import { ExternalUrls } from '../../config/external-urls';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';
import { PageContentCell } from '../../components/Page/Page';

export function JeugdThemaPagina() {
  const {
    isError,
    isLoading,
    voorzieningen,
    title,
    tableConfig: tableConfigs,
  } = useJeugdThemaData();

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph className="ams-mb--sm">
        Hieronder ziet u uw voorzieningen Leerlingenvervoer. Heeft u vragen of
        wilt u een wijziging doorgeven? Bel dan gratis de Wmo Helpdesk:{' '}
      </Paragraph>
      <Paragraph>
        <Link rel="noreferrer" href="tel:08000643" variant="inline">
          0800 0643
        </Link>{' '}
        (maandag tot en met vrijdag van 08.00 tot 18.00 uur)
      </Paragraph>
    </PageContentCell>
  );

  const linkListItems: LinkProps[] = [
    {
      to: ExternalUrls.LEERLINGENVERVOER_LEES_MEER,
      title: 'Lees hier meer over Leerlingenvervoer',
    },
  ];

  const tables = Object.entries(tableConfigs).map(([kind, config]) => {
    return (
      <ThemaPaginaTable<LeerlingenvervoerVoorzieningFrontend>
        key={kind}
        title={config.title}
        className={config.className}
        zaken={voorzieningen.filter(config.filter)}
        displayProps={config.displayProps}
        textNoContent={config.textNoContent}
        maxItems={config.maxItems}
      />
    );
  });

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
    </>
  );
}
