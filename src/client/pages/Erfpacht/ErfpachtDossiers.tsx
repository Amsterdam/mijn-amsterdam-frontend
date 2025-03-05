import { listPageParamKind } from './Erfpacht-thema-config';
import { useErfpachtV2Data } from './erfpachtData.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function ErfpachtDossiers() {
  const { isLoading, isError, dossiers, tableConfig, routes } =
    useErfpachtV2Data();

  const tableConfigDossiers = tableConfig?.[listPageParamKind.erfpachtRechten];
  console.log('tableConfigDossiers', tableConfigDossiers);
  const displayPropsDossiers = tableConfigDossiers?.displayProps ?? {};

  return (
    <ListPagePaginated
      items={dossiers}
      title={tableConfigDossiers?.title ?? 'Erfpachtrechten'}
      appRoute={tableConfigDossiers?.listPageRoute ?? ''}
      appRouteBack={routes.themaPage}
      displayProps={displayPropsDossiers}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
