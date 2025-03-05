import { Grid, Paragraph } from '@amsterdam/design-system-react';
import { generatePath } from 'react-router-dom';

import { tableConfig } from './Vergunningen-thema-config';
import styles from './Vergunningen.module.scss';
import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { LinkProps } from '../../../universal/types';
import { CaseTypeV2 } from '../../../universal/types/vergunningen';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export function VergunningenThemaPagina() {
  const { VERGUNNINGENv2 } = useAppStateGetter();
  const vergunningen = addLinkElementToProperty<VergunningFrontendV2>(
    VERGUNNINGENv2.content ?? [],
    'title'
  );

  const hasActualGPK = vergunningen.find(
    (vergunning) =>
      !vergunning.processed && vergunning.caseType === CaseTypeV2.GPK
  );

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      {
        title,
        displayProps,
        filter: vergunningenListFilter,
        sort: vergunningenListSort,
      },
    ]) => {
      return (
        <ThemaPaginaTable<VergunningFrontendV2>
          key={kind}
          title={title}
          zaken={vergunningen
            .filter(vergunningenListFilter)
            .sort(vergunningenListSort)}
          listPageRoute={generatePath(AppRoutes['VERGUNNINGEN/LIST'], {
            kind,
          })}
          displayProps={displayProps}
        />
      );
    }
  );

  const pageContentTop = (
    <Paragraph>
      Hier ziet u een overzicht van uw aanvragen voor vergunningen en
      ontheffingen bij gemeente Amsterdam.
    </Paragraph>
  );

  const pageContentBottom = hasActualGPK && (
    <Grid.Cell start={3} span={7}>
      <Paragraph className={styles.SuppressedParagraph}>
        Hebt u naast een Europese gehandicaptenparkeerkaart (GPK) ook een vaste
        parkeerplaats voor gehandicapten (GPP) aangevraagd? Dan ziet u hier in
        Mijn Amsterdam alleen de aanvraag voor een GPK staan. Zodra de GPK is
        gegeven, ziet u ook uw aanvraag voor uw GPP in Mijn Amsterdam.
      </Paragraph>
    </Grid.Cell>
  );

  const linkListItems: LinkProps[] = [
    {
      to: 'https://www.amsterdam.nl/ondernemen/vergunningen/wevos/',
      title: 'Ontheffing RVV en TVM aanvragen',
    },
  ];

  return (
    <ThemaPagina
      title={ThemaTitles.VERGUNNINGEN}
      pageContentTop={pageContentTop}
      linkListItems={linkListItems}
      pageContentBottom={pageContentBottom}
      pageContentMain={tables}
      isError={isError(VERGUNNINGENv2)}
      isLoading={isLoading(VERGUNNINGENv2)}
    />
  );
}
