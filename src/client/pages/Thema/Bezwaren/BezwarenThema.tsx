import { Link, Paragraph } from '@amsterdam/design-system-react';

import { links } from './Bezwaren-thema-config';
import { useBezwarenThemaData } from './useBezwarenThemaData.hook';
import { BezwaarFrontend } from '../../../../server/services/bezwaren/types';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

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
    tableConfig,
    bezwaren,
    isLoading,
    isError,
    themaConfig,
    routeConfig,
  } = useBezwarenThemaData();
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
