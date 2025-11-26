import { Paragraph } from '@amsterdam/design-system-react';

import { useKrefiaThemaData } from './useKrefiaThemaData.hook';
import type { KrefiaDeepLink } from '../../../../server/services/krefia/krefia.types';
import { entries } from '../../../../universal/helpers/utils';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function KrefiaThema() {
  const {
    id,
    title,
    deepLinks,
    hasFIBU,
    hasKrefia,
    hasKredietbank,
    tableConfig,
    linkListItems,
    isError,
    isLoading,
    routeConfig,
  } = useKrefiaThemaData();
  useHTMLDocumentTitle(routeConfig.themaPage);

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      {((hasFIBU && hasKredietbank) || !hasKrefia) && (
        <Paragraph>
          Een online plek waar u alle informatie over uw geldzaken kunt vinden
          als klant van Budgetbeheer (FIBU) en/of Kredietbank Amsterdam.
        </Paragraph>
      )}
      {hasKredietbank && !hasFIBU && (
        <Paragraph>
          Een online plek waar u alle informatie over uw geldzaken kunt vinden
          als klant van Kredietbank Amsterdam.
        </Paragraph>
      )}
      {!hasKredietbank && hasFIBU && (
        <Paragraph>
          Een online plek waar u alle informatie over uw geldzaken kunt vinden
          als klant van Budgetbeheer (FIBU).
        </Paragraph>
      )}
    </PageContentCell>
  );

  const krefiaTables = entries(tableConfig).map(
    ([kind, { title, displayProps, filter }]) => {
      return (
        <ThemaPaginaTable<KrefiaDeepLink>
          key={kind}
          title={title}
          zaken={deepLinks.filter(filter)}
          displayProps={displayProps}
        />
      );
    }
  );

  return (
    <ThemaPagina
      id={id}
      title={title}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={krefiaTables}
      linkListItems={linkListItems}
      maintenanceNotificationsPageSlug="krefia"
    />
  );
}
