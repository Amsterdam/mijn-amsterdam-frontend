import {
  tableConfig,
  varenLegesTableLink,
  varenMeerInformatieLink,
  routes,
} from './Varen-thema-config';
import type { VarenVergunningFrontend } from '../../../server/services/varen/config-and-types';
import { Themas } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../hooks/useThemaMenuItems';

export function useVarenThemaData() {
  const { VAREN } = useAppStateGetter();

  const varenRederRegistratie = VAREN.content?.find(
    (item) => item.caseType === 'Varen registratie reder'
  );

  const vergunningen = VAREN.content?.filter(
    (item) => item.caseType !== 'Varen registratie reder'
  );

  const varenVergunningen = addLinkElementToProperty<VarenVergunningFrontend>(
    vergunningen ?? [],
    'vesselName',
    true
  );

  const breadcrumbs = useThemaBreadcrumbs(Themas.VAREN);

  return {
    varenRederRegistratie,
    tableConfig,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
    varenVergunningen,
    linkListItems: [varenMeerInformatieLink, varenLegesTableLink],
    buttonItems: [],
    routes,
    breadcrumbs,
  };
}
