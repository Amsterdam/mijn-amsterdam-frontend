import { getTableConfig, linkListItems } from './Erfpacht-thema-config';
import { ErfpachtV2DossiersResponse } from '../../../server/services/simple-connect/erfpacht';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useErfpachtV2Data() {
  const { ERFPACHTv2 } = useAppStateGetter();
  const erfpachtData = ERFPACHTv2.content as ErfpachtV2DossiersResponse | null;

  // Dossiers
  const dossiersBase = erfpachtData?.dossiers ?? null;

  const dossiers = addLinkElementToProperty(
    dossiersBase?.dossiers ?? [],
    'voorkeursadres'
  );

  // Facturen
  const openFacturenBase = erfpachtData?.openstaandeFacturen ?? null;
  const openFacturen = openFacturenBase?.facturen ?? [];

  const tableConfig = getTableConfig({ erfpachtData });

  return {
    title: ThemaTitles.ERFPACHTv2,
    ERFPACHTv2,
    openFacturen,
    dossiers,
    isLoading: isLoading(ERFPACHTv2),
    isError: isError(ERFPACHTv2),
    linkListItems,
    tableConfig,
  };
}
