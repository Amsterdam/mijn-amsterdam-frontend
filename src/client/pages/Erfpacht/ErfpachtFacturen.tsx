import { Chapters } from '../../../universal/config/chapter';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/TablePagePaginated/ListPagePaginated';
import { useErfpachtV2Data } from './Erfpacht';

export default function ErfpachtFacturen() {
  const {
    ERFPACHTv2,
    openFacturen,
    displayPropsOpenFacturen,
    titleOpenFacturen,
  } = useErfpachtV2Data();

  return (
    <ListPagePaginated
      items={openFacturen}
      title={`Alle ${titleOpenFacturen?.toLocaleLowerCase()}`}
      appRoute={AppRoutes['ERFPACHTv2/OPEN_FACTUREN']}
      appRouteBack={AppRoutes['ERFPACHTv2']}
      displayProps={displayPropsOpenFacturen ?? {}}
      chapter={Chapters.ERFPACHTv2}
      titleKey="dossieradres"
      isLoading={isLoading(ERFPACHTv2)}
      isError={isError(ERFPACHTv2)}
    />
  );
}
