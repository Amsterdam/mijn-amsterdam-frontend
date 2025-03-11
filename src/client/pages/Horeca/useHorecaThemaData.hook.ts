import { isError } from 'lodash';

import { tableConfig, LinkListItems, routes } from './Horeca-thema-config';
import { HorecaVergunningFrontend } from '../../../server/services/horeca/config-and-types';
import { Themas } from '../../../universal/config/thema';
import { isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaMenuItemByThemaID } from '../../hooks/useThemaMenuItems';

export function useHorecaThemaData() {
  const { HORECA } = useAppStateGetter();
  const themaLink = useThemaMenuItemByThemaID(Themas.HORECA);
  const vergunningen = addLinkElementToProperty<HorecaVergunningFrontend>(
    HORECA.content ?? [],
    'identifier',
    true
  );

  return {
    vergunningen,
    isLoading: isLoading(HORECA),
    isError: isError(HORECA),
    linkListItems: LinkListItems,
    routes,
    tableConfig,
    themaTitle: ThemaTitles.HORECA,
    themaPaginaBreadcrumb: themaLink,
  };
}
