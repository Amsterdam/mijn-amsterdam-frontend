import { useErfpachtThemaData } from './erfpachtData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';

export function ErfpachtListOpenFacturen() {
  const {
    tableConfig,
    isLoading,
    isError,
    openFacturen,
    listPageParamKind,
    breadcrumbs,
  } = useErfpachtThemaData();

  const tableConfigFacturen = tableConfig?.[listPageParamKind.openFacturen];
  const displayProps = tableConfigFacturen?.displayProps ?? {};

  return (
    <ListPagePaginated
      items={openFacturen}
      title={tableConfigFacturen?.title ?? 'Openstaande facturen'}
      appRoute={tableConfigFacturen?.listPageRoute ?? ''}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
