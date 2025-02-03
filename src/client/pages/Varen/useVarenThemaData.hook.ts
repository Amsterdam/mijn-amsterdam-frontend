import { GridColumnNumber } from '@amsterdam/design-system-react';

import { tableConfig } from './Varen-thema-config';
import {
  caseTypeVaren,
  VarenVergunningFrontend,
} from '../../../server/services/varen/config-and-types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { entries } from '../../../universal/helpers/utils';
import { RowSet } from '../../components/Datalist/Datalist';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { linkListItems } from '../Afis/Afis-thema-config';

export function useVarenThemaData() {
  const { VAREN } = useAppStateGetter();

  const varenRederRegistratie = VAREN.content?.find(
    (item) => item.caseType === caseTypeVaren.VarenRederRegistratie
  );

  const labelMap = {
    company: 'Bedrijfsnaam',
    email: 'E-mailadres',
    phone: 'Telefoonnummer',
    bsnkvk: 'KVK nummer',
    address: 'Adres',
  };

  const thirdOfGrid: GridColumnNumber = 4;
  const gegevensAanvrager: RowSet | null = varenRederRegistratie
    ? {
        rows: entries(labelMap)
          .map(([key, label]) => ({
            label,
            content: varenRederRegistratie[key],
            span: thirdOfGrid,
          }))
          .filter(({ content }) => !!content),
      }
    : null;

  const vergunningen = VAREN.content?.filter(
    (item) => item.caseType !== caseTypeVaren.VarenRederRegistratie
  );

  const varenVergunningen = addLinkElementToProperty<VarenVergunningFrontend>(
    vergunningen ?? [],
    'vesselName',
    true
  );

  return {
    gegevensAanvrager,
    varenRederRegistratie,
    tableConfig,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
    varenVergunningen,
    linkListItems,
  };
}
