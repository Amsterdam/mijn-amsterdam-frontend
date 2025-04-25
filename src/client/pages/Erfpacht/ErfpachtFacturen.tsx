import { Heading } from '@amsterdam/design-system-react';
import { useParams } from 'react-router';

import { useErfpachtThemaData } from './erfpachtData.hook';
import { ErfpachtDossiersDetail } from '../../../server/services/erfpacht/erfpacht-types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { PageContentCell } from '../../components/Page/Page';
import { BFFApiUrls } from '../../config/api';
import { BagThemas } from '../../config/thema';
import { useAppStateBagApi } from '../../hooks/useAppState';

export function ErfpachtFacturen() {
  const { tableConfig, listPageParamKind, breadcrumbs } =
    useErfpachtThemaData();

  const { dossierNummerUrlParam } = useParams<{
    dossierNummerUrlParam: string;
  }>();

  const [dossierApiResponse, api] = useAppStateBagApi<ErfpachtDossiersDetail>({
    url: `${BFFApiUrls.ERFPACHT_DOSSIER_DETAILS}/${dossierNummerUrlParam}`,
    bagThema: BagThemas.ERFPACHT,
    key: dossierNummerUrlParam ?? 'erfpacht-dossier',
  });

  const dossier = dossierApiResponse.content;
  const tableConfigFacturen = tableConfig?.[listPageParamKind.alleFacturen];
  const displayProps = tableConfigFacturen?.displayProps ?? {};

  return (
    <ListPagePaginated
      pageContentTop={
        !!dossier && (
          <PageContentCell spanWide={8}>
            <Heading level={3} size="level-2">
              {dossier.voorkeursadres}
            </Heading>
          </PageContentCell>
        )
      }
      items={dossier?.facturen?.facturen ?? []}
      title={tableConfigFacturen?.title ?? 'Facturen'}
      appRoute={tableConfigFacturen?.listPageRoute ?? ''}
      appRouteParams={{ dossierNummerUrlParam }}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading(dossierApiResponse)}
      isError={isError(dossierApiResponse)}
    />
  );
}
