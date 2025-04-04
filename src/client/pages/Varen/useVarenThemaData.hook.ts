import {
  tableConfig,
  varenLegesTableLink,
  varenMeerInformatieLink,
} from './Varen-thema-config';
import { VarenZakenFrontend } from '../../../server/services/varen/config-and-types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useVarenThemaData() {
  const { VAREN } = useAppStateGetter();

  const varenRederRegistratie = VAREN.content?.reder;

  const zaken = VAREN.content?.zaken ?? [];

  const varenZaken = addLinkElementToProperty<VarenZakenFrontend>(
    zaken,
    'vesselName',
    true
  );

  return {
    varenRederRegistratie,
    tableConfig,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
    varenZaken,
    linkListItems: [varenMeerInformatieLink, varenLegesTableLink],
    buttonItems: [],
  };
}
