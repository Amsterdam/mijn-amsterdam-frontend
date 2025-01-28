import { Paragraph } from '@amsterdam/design-system-react';

import { useVergunningenThemaData } from './useVergunningenThemaData.hook';
import styles from './Vergunningen.module.scss';
import {
  DecosVergunning,
  VergunningFrontend,
} from '../../../server/services/vergunningen/config-and-types';
import { CaseTypeV2 } from '../../../universal/types/decos-zaken';
import { PageContentCell } from '../../components/Page/Page';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <Paragraph>
    Hier ziet u een overzicht van uw aanvragen voor vergunningen en ontheffingen
    bij gemeente Amsterdam.
  </Paragraph>
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

  const hasActualGPK = vergunningen.find(
    (vergunning) =>
      !vergunning.processed && vergunning.caseType === CaseTypeV2.GPK
  );

  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, sort, listPageRoute }]) => {
      return (
        <ThemaPaginaTable<VergunningFrontend<DecosVergunning>>
          key={kind}
          title={title}
          zaken={vergunningen.filter(filter).sort(sort)}
          listPageRoute={listPageRoute}
          displayProps={displayProps}
        />
      );
    }
  );

  const pageContentBottom = hasActualGPK && (
    <PageContentCell startWide={3} spanWide={7}>
      <Paragraph className={styles.SuppressedParagraph}>
        Hebt u naast een Europese gehandicaptenparkeerkaart (GPK) ook een vaste
        parkeerplaats voor gehandicapten (GPP) aangevraagd? Dan ziet u hier in
        Mijn Amsterdam alleen de aanvraag voor een GPK staan. Zodra de GPK is
        gegeven, ziet u ook uw aanvraag voor uw GPP in Mijn Amsterdam.
      </Paragraph>
    </PageContentCell>
  );

  return (
    <ThemaPagina
      title={title}
      pageContentTop={pageContentTop}
      linkListItems={linkListItems}
      pageContentBottom={pageContentBottom}
      pageContentMain={tables}
      isError={isError}
      isLoading={isLoading}
    />
  );
}
