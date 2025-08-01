import { Link, Paragraph } from '@amsterdam/design-system-react';

import { useZorgThemaData } from './useZorgThemaData';
import { WMOVoorzieningFrontend } from '../../../../server/services/wmo/wmo-config-and-types';
import { PageContentCell } from '../../../components/Page/Page';
import { ParagaphSuppressed } from '../../../components/ParagraphSuppressed/ParagraphSuppressed';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export const WMO_HELPDESK_PHONENUMBER = '0800 0643' as const;
export const WMO_HELPDESK_HREF_TEL_LINK =
  `tel:${WMO_HELPDESK_PHONENUMBER.replace(' ', '')}` as const;

export function HistoricItemsMention() {
  return (
    <ParagaphSuppressed>
      U ziet hier informatie vanaf 1 januari 2018. Wilt u iets weten van
      daarvoor? Bel dan de Wmo Helpdesk:{' '}
      <Link href={WMO_HELPDESK_HREF_TEL_LINK} rel="noreferrer">
        {WMO_HELPDESK_PHONENUMBER}
      </Link>
      . U ziet ook geen begeleid thuis en beschermd verblijf (vroeger
      maatschappelijke opvang en beschermd wonen). Hier zijn we nog mee bezig.
    </ParagaphSuppressed>
  );
}

export function ZorgThema() {
  const {
    isError,
    isLoading,
    voorzieningen,
    id,
    title,
    tableConfig,
    linkListItems,
    routeConfig,
  } = useZorgThemaData();
  useHTMLDocumentTitle(routeConfig.themaPage);

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph className="ams-mb-m">
        Hieronder ziet u uw voorzieningen vanuit de Wet maatschappelijke
        ondersteuning (Wmo).
      </Paragraph>
      <Paragraph>
        Heeft u vragen of wilt u een wijziging doorgeven? <br />
        Bel dan gratis de Wmo Helpdesk:{' '}
        <Link rel="noreferrer" href={WMO_HELPDESK_HREF_TEL_LINK}>
          {WMO_HELPDESK_PHONENUMBER}
        </Link>{' '}
        (maandag tot en met vrijdag van 08.00 tot 18.00 uur) of ga langs bij het
        Sociaal Loket.
      </Paragraph>
    </PageContentCell>
  );

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, textNoContent, filter, maxItems, listPageRoute },
    ]) => {
      return (
        <ThemaPaginaTable<WMOVoorzieningFrontend>
          key={kind}
          title={title}
          zaken={voorzieningen.filter(filter)}
          listPageRoute={listPageRoute}
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
        id={id}
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
