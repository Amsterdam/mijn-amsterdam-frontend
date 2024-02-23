import { Chapters } from '../../../universal/config/chapter';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { useErfpachtV2Data } from './erfpachtData.hook';

export default function ErfpachtDossiers() {
  const {
    ERFPACHTv2,
    dossiers,
    displayPropsDossiers,
    titleDossiers,
    colStyles,
  } = useErfpachtV2Data();

  return (
    <ListPagePaginated
      items={dossiers}
      title={`Alle ${titleDossiers?.toLowerCase()}`}
      appRoute={AppRoutes['ERFPACHTv2/DOSSIERS']}
      appRouteBack={AppRoutes['ERFPACHTv2']}
      displayProps={displayPropsDossiers}
      chapter={Chapters.ERFPACHTv2}
      isLoading={isLoading(ERFPACHTv2)}
      isError={isError(ERFPACHTv2)}
      tableGridColStyles={colStyles.dossiersTable}
    />
  );
}
