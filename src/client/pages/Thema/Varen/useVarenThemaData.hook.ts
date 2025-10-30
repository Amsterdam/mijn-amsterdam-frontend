import { CONTENT_EMPTY } from './helper';
import {
  tableConfig,
  varenLegesTableLink,
  varenMeerInformatieLink,
  themaTitle,
  themaId,
  routeConfig,
} from './Varen-thema-config';
import type {
  VarenVergunningFrontend,
  VarenZakenFrontend,
} from '../../../../server/services/varen/config-and-types';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useVarenThemaData() {
  const { VAREN } = useAppStateGetter();

  const varenRederRegistratie = VAREN.content?.reder || null;

  const zaken = VAREN.content?.zaken ?? [];
  const varenZaken = addLinkElementToProperty<VarenZakenFrontend>(
    zaken.map((z) => ({
      ...z,
      vesselName: z.vesselName || z.identifier || CONTENT_EMPTY, // Fallback to have clickable text, vesselname should never be empty
    })),
    'vesselName',
    true
  );

  const vergunningen = VAREN.content?.vergunningen ?? [];
  const varenVergunningen = addLinkElementToProperty<VarenVergunningFrontend>(
    vergunningen.map((v) => ({
      ...v,
      vesselName: v.vesselName || v.vergunningKenmerk || CONTENT_EMPTY, // Fallback to have clickable text, vesselname should never be empty
    })),
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
    varenVergunningen,
    linkListItems: [varenMeerInformatieLink, varenLegesTableLink],
    buttonItems: [],
    breadcrumbs,
    id: themaId,
    title: themaTitle,
    routeConfig,
  };
}
