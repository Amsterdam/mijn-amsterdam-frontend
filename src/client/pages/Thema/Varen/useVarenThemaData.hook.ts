import {
  tableConfig,
  varenLegesTableLink,
  varenMeerInformatieLink,
  themaTitle,
  themaId,
  routeConfig,
} from './Varen-thema-config.ts';
import type { VarenZakenFrontend } from '../../../../server/services/varen/config-and-types.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppState.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useVarenThemaData() {
  const { VAREN } = useAppStateGetter();

  const varenRederRegistratie = VAREN.content?.reder || null;

  const zaken = VAREN.content?.zaken ?? [];

  const varenZaken = addLinkElementToProperty<VarenZakenFrontend>(
    zaken,
    'vesselName',
    true
  );

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    varenRederRegistratie,
    tableConfig,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
    varenZaken,
    linkListItems: [varenMeerInformatieLink, varenLegesTableLink],
    buttonItems: [],
    breadcrumbs,
    title: themaTitle,
    routeConfig,
  };
}
