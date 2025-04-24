import {
  tableConfig,
  varenLegesTableLink,
  varenMeerInformatieLink,
  routes,
} from './Varen-thema-config';
import type { VarenZakenFrontend } from '../../../server/services/varen/config-and-types';
import { ThemaIDs } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../hooks/useThemaMenuItems';

export function useVarenThemaData() {
  const { VAREN } = useAppStateGetter();

  const varenRederRegistratie = VAREN.content?.reder || null;

  const zaken = VAREN.content?.zaken ?? [];

  const varenZaken = addLinkElementToProperty<VarenZakenFrontend>(
    zaken,
    'vesselName',
    true
  );

  const breadcrumbs = useThemaBreadcrumbs(ThemaIDs.VAREN);

  return {
    varenRederRegistratie,
    tableConfig,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
    varenZaken,
    linkListItems: [varenMeerInformatieLink, varenLegesTableLink],
    buttonItems: [],
    routes,
    breadcrumbs,
  };
}
