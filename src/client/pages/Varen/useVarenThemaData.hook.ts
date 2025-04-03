import {
  tableConfig,
  varenLegesTableLink,
  varenMeerInformatieLink,
  routes,
} from './Varen-thema-config';
import { VarenZakenFrontend } from '../../../server/services/varen/config-and-types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useVarenThemaData() {
  const { VAREN } = useAppStateGetter();

  const varenRederRegistratie = VAREN.content?.reder;

  const vergunningen = VAREN.content?.zaken ?? [];

  const varenVergunningen = addLinkElementToProperty<VarenZakenFrontend>(
    vergunningen,
    'vesselName',
    true
  );

  return {
    varenRederRegistratie,
    tableConfig,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
    varenVergunningen,
    linkListItems: [varenMeerInformatieLink, varenLegesTableLink],
    buttonItems: [],
    routes,
  };
}
