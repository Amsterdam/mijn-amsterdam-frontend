import { Paragraph } from '@amsterdam/design-system-react';

import { useKlachtenThemaData } from './useKlachtenThemaData.hook';
import { Klacht } from '../../../server/services/klachten/types';
import { PageContentCell } from '../../components/Page/Page';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <PageContentCell spanWide={6}>
    <Paragraph>
      Hier ziet u een overzicht van de klachten die U heeft ingediend bij
      gemeente Amsterdam.
    </Paragraph>
  </PageContentCell>
);

export function KlachtenThemaPagina() {
  const {
    themaTitle,
    tableConfig,
    klachten,
    isLoading,
    isError,
    linkListItems,
  } = useKlachtenThemaData();

  return (
    <ThemaPagina
      title={themaTitle}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={
        <ThemaPaginaTable<Klacht>
          title={tableConfig.title}
          listPageRoute={tableConfig.listPageRoute}
          zaken={klachten}
          displayProps={tableConfig.displayProps}
          maxItems={tableConfig.maxItems}
        />
      }
      linkListItems={linkListItems}
    />
  );
}
