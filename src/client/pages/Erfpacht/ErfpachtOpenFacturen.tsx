import { useErfpachtV2Data } from './erfpachtData.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function ErfpachtOpenFacturen() {
  const {
    tableConfig,
    isLoading,
    isError,
    openFacturen,
    listPageParamKind,
    themaPaginaBreadcrumb,
  } = useErfpachtV2Data();

  const tableConfigFacturen = tableConfig?.[listPageParamKind.openFacturen];
  const displayProps = tableConfigFacturen?.displayProps ?? {};

  return (
    <ListPagePaginated
      items={openFacturen}
      title={tableConfigFacturen?.title ?? 'Openstaande facturen'}
      appRoute={tableConfigFacturen?.listPageRoute ?? ''}
      breadcrumbs={[themaPaginaBreadcrumb]}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
