import { listPageParamKind } from './Erfpacht-thema-config';
import { useErfpachtV2Data } from './erfpachtData.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function ErfpachtDossiers() {
  const { isLoading, isError, dossiers, tableConfig, breadcrumbs } =
    useErfpachtV2Data();

  const tableConfigDossiers = tableConfig?.[listPageParamKind.erfpachtRechten];
  const displayPropsDossiers = tableConfigDossiers?.displayProps ?? {};

  return (
    <ListPagePaginated
      items={dossiers}
      title={tableConfigDossiers?.title ?? 'Erfpachtrechten'}
      appRoute={tableConfigDossiers?.listPageRoute ?? ''}
      breadcrumbs={breadcrumbs}
      displayProps={displayPropsDossiers}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
