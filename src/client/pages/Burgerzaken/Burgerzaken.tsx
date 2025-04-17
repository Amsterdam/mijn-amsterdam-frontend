import { Paragraph } from '@amsterdam/design-system-react';

import { useBurgerZakenData } from './useBurgerZakenData.hook';
import { IdentiteitsbewijsFrontend } from '../../../universal/types';
import { PageContentCell } from '../../components/Page/Page';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../components/Thema/ThemaPaginaTable';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph>
      Hieronder vindt u gegevens van uw paspoort en/of ID-kaart.
    </Paragraph>
  </PageContentCell>
);

export function Burgerzaken() {
  const { tableConfig, documents, isLoading, isError, linkListItems } =
    useBurgerZakenData();

  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, sort, listPageRoute }]) => {
      return (
        <ThemaPaginaTable<IdentiteitsbewijsFrontend>
          key={kind}
          title={title}
          zaken={documents.sort(sort)}
          listPageRoute={listPageRoute}
          displayProps={displayProps}
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
