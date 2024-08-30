import {
  Grid,
  Heading,
  LinkList,
  Paragraph,
  Screen,
} from '@amsterdam/design-system-react';
import { AfisBusinessPartnerDetailsTransformed } from '../../../server/services/afis/afis-types';
import { Datalist } from '../../components/Datalist/Datalist';
import styles from './AfisBetaalVoorkeuren.module.scss';
import { useAppStateBagApi, useAppStateGetter } from '../../hooks/useAppState';
import { BFFApiUrls } from '../../config/api';
import { BagThemas } from '../../config/thema';
import { AppRoutes } from '../../../universal/config/routes';
import {
  ErrorAlert,
  OverviewPage,
  PageHeading,
  ThemaIcon,
} from '../../components';
import { hasFailedDependency, isError } from '../../../universal/helpers/api';

type BusinessPartnerKey = keyof Omit<
  AfisBusinessPartnerDetailsTransformed,
  'addressId'
>;

const labels: Record<BusinessPartnerKey, string> = {
  businessPartnerId: 'Debiteurnummer',
  fullName: 'Debiteurnaam',
  address: 'Adres',
  email: 'E-mailadres factuur',
  phone: 'Telefoonnummer',
};

type AfisBusinessPartnerProps = {
  businesspartner: AfisBusinessPartnerDetailsTransformed;
};

export default function AfisBetaalVoorkeuren() {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted = AFIS?.content?.businessPartnerIdEncrypted;

  return (
    businessPartnerIdEncrypted && (
      <AfisBetaalVoorkeurenContent
        businessPartnerIdEncrypted={businessPartnerIdEncrypted}
      />
    )
  );
}

function AfisBetaalVoorkeurenContent({
  businessPartnerIdEncrypted,
}: {
  businessPartnerIdEncrypted: string;
}) {
  const [businesspartner, api] =
    useAppStateBagApi<AfisBusinessPartnerDetailsTransformed | null>({
      url: `${BFFApiUrls.AFIS_BUSINESSPARTNER}/${businessPartnerIdEncrypted}`,
      bagThema: BagThemas.AFIS,
      key: businessPartnerIdEncrypted,
    });

  const hasError = isError(api.data);
  const failedEmail = hasFailedDependency(api.data, 'email');
  const failedPhone = hasFailedDependency(api.data, 'phone');

  return (
    <OverviewPage>
      <PageHeading
        icon={<ThemaIcon />}
        backLink={{
          title: 'Terug naar Afis',
          to: AppRoutes.AFIS,
        }}
      >
        Betaalvoorkeuren
      </PageHeading>
      <Screen>
        <Grid>
          <Grid.Cell span="all">
            <Paragraph>
              Hier kunt u uw betaal gegevens inzien en automatische incasso
              gegevens instellen.
            </Paragraph>
          </Grid.Cell>
          <Grid.Cell span="all">
            <LinkList>
              <LinkList.Link
                rel="noreferrer"
                href={
                  'https://www.amsterdam.nl/veelgevraagd/facturen-van-de-gemeente-controleren-gegevens-wijzigen-automatische-incasso-regelen-38caa'
                }
              >
                Meer over betalen aan de gemeente
              </LinkList.Link>
            </LinkList>
          </Grid.Cell>
          {hasError && (
            <Grid.Cell span="all">
              <ErrorAlert>
                <>
                  De volgende gegevens konden niet worden opgehaald:
                  {failedEmail && (
                    <>
                      <br />- Email
                    </>
                  )}
                  {failedPhone && (
                    <>
                      <br />- Telefoonnummer
                    </>
                  )}
                </>{' '}
              </ErrorAlert>
            </Grid.Cell>
          )}
          <Grid.Cell span="all">
            <Heading level={3} size="level-3">
              Betaalgegevens
            </Heading>
          </Grid.Cell>
          <Grid.Cell span={6}>
            {businesspartner && (
              <AfisBusinessPartner businesspartner={businesspartner} />
            )}
          </Grid.Cell>
          <Grid.Cell span={6}>
            <LinkList>
              <LinkList.Link rel="noreferrer" href={'#'}>
                Wijzigingen
              </LinkList.Link>
            </LinkList>
          </Grid.Cell>
        </Grid>
      </Screen>
    </OverviewPage>
  );
}

function AfisBusinessPartner({ businesspartner }: AfisBusinessPartnerProps) {
  const rows = Object.entries(labels).map(([key, label]) => {
    return {
      label,
      content: businesspartner[key as BusinessPartnerKey],
    };
  });

  return <Datalist rows={rows} className={styles.DataList} />;
}
