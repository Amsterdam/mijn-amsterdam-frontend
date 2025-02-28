import { Link, Paragraph } from '@amsterdam/design-system-react';
import { generatePath } from 'react-router-dom';

import { useZorgThemaData } from './useZorgThemaData';
import { WMOVoorzieningFrontend } from '../../../server/services/wmo/wmo-config-and-types';
import { PageContentCell } from '../../components/Page/Page';
import { ParagaphSuppressed } from '../../components/ParagraphSuppressed/ParagraphSuppressed';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export function HistoricItemsMention() {
  return (
    <ParagaphSuppressed>
      U ziet hier informatie vanaf 1 januari 2018. Wilt u iets weten van
      daarvoor? Bel dan de Wmo Helpdesk:{' '}
      <Link href="tel:08000643" rel="noreferrer">
        0800 0643
      </Link>
      . U ziet ook geen begeleid thuis en beschermd verblijf (vroeger
      maatschappelijke opvang en beschermd wonen). Hier zijn we nog mee bezig.
    </ParagaphSuppressed>
  );
}

export function ZorgThemaPagina() {
  const {
    isError,
    isLoading,
    regelingen,
    title,
    routes,
    tableConfig,
    linkListItems,
  } = useZorgThemaData();

  const pageContentTop = (
    <PageContentCell spanWide={6}>
      <Paragraph className="ams-mb--sm">
        Hieronder ziet u uw voorzieningen vanuit de Wet maatschappelijke
        ondersteuning (Wmo).
      </Paragraph>
      <Paragraph>
        Heeft u vragen of wilt u een wijziging doorgeven? <br />
        Bel dan gratis de Wmo Helpdesk:{' '}
        <Link rel="noreferrer" href="tel:08000643" variant="inline">
          0800 0643
        </Link>{' '}
        (maandag tot en met vrijdag van 08.00 tot 18.00 uur) of ga langs bij het
        Sociaal Loket.
      </Paragraph>
    </PageContentCell>
  );

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
        pageContentMain={
          <>
            {tables}
            <PageContentCell spanWide={8} startWide={3}>
              <HistoricItemsMention />
            </PageContentCell>
          </>
        }
        isError={isError}
        isLoading={isLoading}
      />
    </>
  );
}
