import { Paragraph } from '@amsterdam/design-system-react';

import { useBezwarenThemaData } from './useBezwarenThemaData.hook';
import { Bezwaar } from '../../../server/services/bezwaren/types';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <Paragraph>Hier ziet u een overzicht van uw ingediende bezwaren.</Paragraph>
);

export function BezwarenThemaPagina() {
  const {
    themaTitle,
    tableConfig,
    bezwaren,
    isLoading,
    isError,
    linkListItems,
  } = useBezwarenThemaData();

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, filter, textNoContent, listPageRoute, maxItems },
    ]) => {
      return (
        <ThemaPaginaTable<Bezwaar>
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
