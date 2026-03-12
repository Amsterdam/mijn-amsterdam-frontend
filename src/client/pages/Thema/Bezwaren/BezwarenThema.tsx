import { Link, Paragraph } from '@amsterdam/design-system-react';

import { links } from './Bezwaren-thema-config.ts';
import { useBezwarenThemaData } from './useBezwarenThemaData.hook.ts';
import type { BezwaarFrontend } from '../../../../server/services/bezwaren/types.ts';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

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
  const { tableConfig, bezwaren, isLoading, isError, themaConfig } =
    useBezwarenThemaData();
  useHTMLDocumentTitle(themaConfig.route);

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
      title={themaConfig.title}
      id={themaConfig.id}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={tables}
      pageLinks={themaConfig.pageLinks}
      maintenanceNotificationsPageSlug="bezwaren"
    />
  );
}
