import { isError } from 'lodash';

import { tableConfig, LinkListItems, routes } from './Horeca-thema-config';
import { HorecaVergunning } from '../../../server/services/horeca/config-and-types';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useHorecaThemaData() {
  const { HORECA } = useAppStateGetter();

  const vergunningen = addLinkElementToProperty<
    VergunningFrontend<HorecaVergunning>
  >(HORECA.content ?? [], 'identifier', true);

  return {
    vergunningen,
    isLoading: isLoading(HORECA),
    isError: isError(HORECA),
    linkListItems: LinkListItems,
    routes,
    tableConfig,
    themaTitle: ThemaTitles.HORECA,
  };
}
