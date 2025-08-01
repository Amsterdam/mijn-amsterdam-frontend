import { Link, Paragraph } from '@amsterdam/design-system-react';

import { linkListItems } from './Jeugd-thema-config';
import { useJeugdThemaData } from './useJeugdThemaData';
import { LeerlingenvervoerVoorzieningFrontend } from '../../../../server/services/jeugd/jeugd';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';
import {
  WMO_HELPDESK_HREF_TEL_LINK,
  WMO_HELPDESK_PHONENUMBER,
} from '../Zorg/ZorgThema';
import { ParagaphSuppressed } from '../../../components/ParagraphSuppressed/ParagraphSuppressed';

export function HistoricItemsMention() {
  return (
    <ParagaphSuppressed>
      U ziet hier informatie vanaf 1 januari 2019. Wilt u iets weten van
      daarvoor? Bel dan de Wmo Helpdesk:{' '}
      <Link href={WMO_HELPDESK_HREF_TEL_LINK} rel="noreferrer">
        {WMO_HELPDESK_PHONENUMBER}
      </Link>
    </ParagaphSuppressed>
  );
}
export function JeugdThemaPagina() {
  const { isError, isLoading, voorzieningen, title, tableConfig, routeConfig } =
    useJeugdThemaData();
  useHTMLDocumentTitle(routeConfig.themaPage);

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph className="ams-mb-m">
        Hieronder ziet u uw voorzieningen Leerlingenvervoer. Heeft u vragen of
        wilt u een wijziging doorgeven? Bel dan gratis de Wmo Helpdesk:{' '}
      </Paragraph>
      <Paragraph>
        <Link rel="noreferrer" href={WMO_HELPDESK_HREF_TEL_LINK}>
          {WMO_HELPDESK_PHONENUMBER}
        </Link>{' '}
        (maandag tot en met vrijdag van 08.00 tot 18.00 uur)
      </Paragraph>
    </PageContentCell>
  );

  const tables = Object.entries(tableConfig).map(([kind, config]) => {
    return (
      <ThemaPaginaTable<LeerlingenvervoerVoorzieningFrontend>
        key={kind}
        title={config.title}
        zaken={voorzieningen.filter(config.filter)}
        listPageRoute={config.listPageRoute}
        displayProps={config.displayProps}
        textNoContent={config.textNoContent}
        maxItems={config.maxItems}
      />
    );
  });

  return (
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
  );
}
