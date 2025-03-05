import { isError } from 'lodash';

import {
  horecaTableConfig,
  HorecaVergunning,
  LinkListItems,
  routes,
} from './Horeca-thema-config';
import { isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useHorecaThemaData() {
  const { HORECA } = useAppStateGetter();

  const vergunningen = addLinkElementToProperty<HorecaVergunning>(
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
    tableConfig: horecaTableConfig,
    themaTitle: ThemaTitles.HORECA,
  };
}
