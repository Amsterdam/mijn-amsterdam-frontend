import { Paragraph } from '@amsterdam/design-system-react';

import { useHorecaThemaData } from './useHorecaThemaData.hook';
import { HorecaVergunning } from '../../../server/services/horeca/config-and-types';
import { PageContentCell } from '../../components/Page/Page';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <PageContentCell>
    <Paragraph>
      Hier ziet u een overzicht van uw aanvragen voor Horeca en ontheffingen bij
      gemeente Amsterdam.
    </Paragraph>
  </PageContentCell>
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
    ([kind, { title, displayProps, filter, listPageRoute, maxItems }]) => {
      return (
        <ThemaPaginaTable<HorecaVergunning>
          key={kind}
          title={title}
          listPageRoute={listPageRoute}
          zaken={vergunningen.filter(filter)}
          displayProps={displayProps}
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
