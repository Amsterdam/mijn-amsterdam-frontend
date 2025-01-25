import { Paragraph } from '@amsterdam/design-system-react';

import { HorecaVergunning } from './Horeca-thema-config';
import { useHorecaThemaData } from './useHorecaThemaData.hook';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <Paragraph>
    Hier ziet u een overzicht van uw aanvragen voor Horeca en ontheffingen bij
    gemeente Amsterdam.
  </Paragraph>
);

export function HorecaThemaPagina() {
  const {
    themaTitle,
    tableConfig,
    vergunningen,
    isLoading,
    isError,
    linkListItems,
  } = useHorecaThemaData();

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, filter, textNoContent, listPageRoute, maxItems },
    ]) => {
      return (
        <ThemaPaginaTable<HorecaVergunning>
          key={kind}
          title={title}
          listPageRoute={listPageRoute}
          zaken={vergunningen.filter(filter)}
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
