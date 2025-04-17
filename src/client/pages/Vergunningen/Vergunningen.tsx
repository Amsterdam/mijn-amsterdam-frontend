import { Paragraph } from '@amsterdam/design-system-react';

import { useVergunningenThemaData } from './useVergunningenThemaData.hook';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { PageContentCell } from '../../components/Page/Page';
import ThemaPagina from '../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../components/Thema/ThemaPaginaTable';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph>
      Hier ziet u een overzicht van uw aanvragen voor vergunningen en
      ontheffingen bij gemeente Amsterdam.
    </Paragraph>
  </PageContentCell>
);

export function VergunningenThemaPagina() {
  const {
    vergunningen,
    isLoading,
    isError,
    tableConfig,
    linkListItems,
    title,
  } = useVergunningenThemaData();

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, filter, sort, listPageRoute, className, maxItems },
    ]) => {
      return (
        <ThemaPaginaTable<VergunningFrontend>
          key={kind}
          title={title}
          zaken={vergunningen.filter(filter).sort(sort)}
          listPageRoute={listPageRoute}
          displayProps={displayProps}
          className={className}
          maxItems={maxItems}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={title}
      pageContentTop={pageContentTop}
      linkListItems={linkListItems}
      pageContentMain={tables}
      isError={isError}
      isLoading={isLoading}
    />
  );
}
