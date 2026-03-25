import { CONTENT_EMPTY } from './helper.ts';
import { tableConfig, themaConfig } from './Varen-thema-config.ts';
import type {
  VarenVergunningFrontend,
  VarenZakenFrontend,
} from '../../../../server/services/varen/config-and-types.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

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

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  return {
    varenRederRegistratie,
    tableConfig,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
    varenZaken,
    varenVergunningen,
    pageLinks: themaConfig.pageLinks,
    buttonItems: [],
    breadcrumbs,
    id: themaConfig.id,
    title: themaConfig.title,
    themaConfig,
  };
}
