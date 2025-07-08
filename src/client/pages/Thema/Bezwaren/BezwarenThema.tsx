import { Link, Paragraph } from '@amsterdam/design-system-react';

import { useBezwarenThemaData } from './useBezwarenThemaData.hook.ts';
import { BezwaarFrontend } from '../../../../server/services/bezwaren/types.ts';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';
import { links } from './Bezwaren-thema-config.ts';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph>
      U ziet hier alle bezwaren die zijn ingediend via ons{' '}
      <Link href={links.BEZWAREN_FORMULIER} rel="noopener noreferrer">
        bezwaarformulier.
      </Link>{' '}
    </Paragraph>
  </PageContentCell>
);

export function BezwarenThema() {
  const {
    themaTitle,
    tableConfig,
    bezwaren,
    isLoading,
    isError,
    linkListItems,
    routeConfig,
  } = useBezwarenThemaData();
  useHTMLDocumentTitle(routeConfig.themaPage);

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, filter, textNoContent, listPageRoute, maxItems },
    ]) => {
      return (
        <ThemaPaginaTable<BezwaarFrontend>
          key={kind}
          title={title}
          listPageRoute={listPageRoute}
          zaken={bezwaren.filter(filter)}
          displayProps={displayProps}
          textNoContent={textNoContent}
          maxItems={maxItems}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={themaTitle}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={tables}
      linkListItems={linkListItems}
    />
  );
}
