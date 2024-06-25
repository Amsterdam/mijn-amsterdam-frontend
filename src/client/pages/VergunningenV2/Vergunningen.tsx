import { Paragraph } from '@amsterdam/design-system-react';
import { VergunningV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { AppRoutes, ThemaTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { ThemaIcon } from '../../components';
import { addLinkElementToProperty } from '../../components/Table/Table';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './Vergunningen.module.scss';

import { LinkProps } from '../../../universal/types';
import { CaseTypeV2 } from '../../../universal/types/vergunningen';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ZakenTable from '../ThemaPagina/ZakenTable';
import {
  displayPropsEerdereVergunningen,
  displayPropsHuidigeVergunningen,
  listPageParamKind,
} from './config';
import { generatePath } from 'react-router-dom';

export default function VergunningenV2() {
  const { VERGUNNINGENv2 } = useAppStateGetter();
  const vergunningen = addLinkElementToProperty<VergunningV2>(
    VERGUNNINGENv2.content ?? [],
    'title'
  );

  const huidigeVergunningen: VergunningV2[] = vergunningen.filter(
    (regeling) => !regeling.processed
  );

  const eerdereVergunningen: VergunningV2[] = vergunningen.filter(
    (regeling) => regeling.processed
  );

  const hasActualGPK = huidigeVergunningen.find(
    (vergunning) => vergunning.caseType === CaseTypeV2.GPK
  );

  const pageContentTables = (
    <>
      <ZakenTable<VergunningV2>
        title="Huidige vergunningen en ontheffingen"
        zaken={huidigeVergunningen}
        listPageRoute={generatePath(AppRoutes['VERGUNNINGEN/LIST'], {
          kind: listPageParamKind.actual,
        })}
        displayProps={displayPropsHuidigeVergunningen}
        textNoContent="U heeft geen huidige vergunningen of ontheffingen."
      />
      <ZakenTable<VergunningV2>
        title="Eerdere en niet verleende vergunningen en ontheffingen"
        zaken={eerdereVergunningen}
        listPageRoute={generatePath(AppRoutes['VERGUNNINGEN/LIST'], {
          kind: listPageParamKind.historic,
        })}
        displayProps={displayPropsEerdereVergunningen}
        textNoContent="U heeft geen eerdere of niet verleende vergunningen of ontheffingen."
      />
    </>
  );

  const pageContentTop = (
    <Paragraph>
      Hier ziet u een overzicht van uw aanvragen voor vergunningen en
      ontheffingen bij gemeente Amsterdam.
    </Paragraph>
  );

  const pageContentBottom = hasActualGPK && (
    <Paragraph className={styles.SuppressedParagraph}>
      Hebt u naast een Europese gehandicaptenparkeerkaart (GPK) ook een vaste
      parkeerplaats voor gehandicapten (GPP) aangevraagd? Dan ziet u hier in
      Mijn Amsterdam alleen de aanvraag voor een GPK staan. Zodra de GPK is
      gegeven, ziet u ook uw aanvraag voor uw GPP in Mijn Amsterdam.
    </Paragraph>
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
      icon={<ThemaIcon />}
      backLink={{
        to: AppRoutes.HOME,
        title: 'Home',
      }}
      pageContentTop={pageContentTop}
      linkListItems={linkListItems}
      pageContentBottom={pageContentBottom}
      pageContentTables={pageContentTables}
      isError={isError(VERGUNNINGENv2)}
      isLoading={isLoading(VERGUNNINGENv2)}
    />
  );
}
