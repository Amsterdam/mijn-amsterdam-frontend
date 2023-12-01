import { Chapters } from '../../../universal/config/chapter';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/TablePagePaginated/ListPagePaginated';
import { useErfpachtV2Data } from './Erfpacht';

export default function ErfpachtDossiers() {
  const { ERFPACHTv2, dossiers, displayPropsDossiers, titleDossiers } =
    useErfpachtV2Data();

  return (
    <ListPagePaginated
      items={dossiers}
      title="Alle dossiers"
      appRoute={AppRoutes['ERFPACHTv2/DOSSIERS']}
      appRouteBack={AppRoutes['ERFPACHTv2']}
      displayProps={displayPropsDossiers}
      chapter={Chapters.ERFPACHTv2}
      titleKey="voorkeursadres"
      isLoading={isLoading(ERFPACHTv2)}
      isError={isError(ERFPACHTv2)}
    />
  );
}
