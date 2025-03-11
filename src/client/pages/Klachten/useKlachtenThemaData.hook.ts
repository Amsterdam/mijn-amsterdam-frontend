import { isError } from 'lodash';

import {
  klachtenTableConfig,
  LinkListItems,
  routes,
} from './Klachten-thema-config';
import type { Klacht } from '../../../server/services/klachten/types';
import { Themas } from '../../../universal/config/thema';
import { isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaMenuItemByThemaID } from '../../hooks/useThemaMenuItems';

export function useKlachtenThemaData() {
  const { KLACHTEN } = useAppStateGetter();

  const klachten = addLinkElementToProperty<Klacht>(
    KLACHTEN.content?.klachten ?? [],
    'id',
    true,
    (klacht) => `Bekijk meer over klacht ${klacht.id}`
  );

  const themaLink = useThemaMenuItemByThemaID(Themas.KLACHTEN);

  return {
    klachten,
    isLoading: isLoading(KLACHTEN),
    isError: isError(KLACHTEN),
    linkListItems: LinkListItems,
    routes,
    tableConfig: klachtenTableConfig,
    themaTitle: ThemaTitles.KLACHTEN,
    themaPaginaBreadcrumb: themaLink,
  };
}
