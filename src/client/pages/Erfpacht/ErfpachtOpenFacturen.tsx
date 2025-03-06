import { useErfpachtV2Data } from './erfpachtData.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function ErfpachtOpenFacturen() {
  const {
    tableConfig,
    isLoading,
    isError,
    openFacturen,
    listPageParamKind,
    routes,
  } = useErfpachtV2Data();

  const tableConfigFacturen = tableConfig?.[listPageParamKind.openFacturen];
  const displayProps = tableConfigFacturen?.displayProps ?? {};

  return (
    <ListPagePaginated
      items={openFacturen}
      title={tableConfigFacturen?.title ?? 'Openstaande facturen'}
      appRoute={tableConfigFacturen?.listPageRoute ?? ''}
      appRouteBack={routes.themaPage}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
