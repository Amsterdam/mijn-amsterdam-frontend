import { Paragraph } from '@amsterdam/design-system-react';

import { useBurgerZakenData } from './useBurgerZakenData.hook';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <Paragraph>
    Hieronder vindt u gegevens van uw paspoort en/of ID-kaart.
  </Paragraph>
);

export function Burgerzaken() {
  const { tableConfig, documents, isLoading, isError, linkListItems } =
    useBurgerZakenData();

  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, sort, listPageRoute }]) => {
      return (
        <ThemaPaginaTable
          key={kind}
          title={title}
          zaken={documents.sort(sort)}
          listPageRoute={listPageRoute}
          displayProps={displayProps}
          textNoContent="Wij kunnen nog geen ID-kaarten tonen."
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={ThemaTitles.BURGERZAKEN}
      isError={isError}
      isPartialError={false}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageContentMain={tables}
      linkListItems={linkListItems}
    />
  );
}
