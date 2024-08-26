import { useAppStateBagApi, useAppStateGetter } from '../../hooks/useAppState';
import { BFFApiUrls } from '../../config/api';
import { AfisBusinessPartnerDetailsTransformed } from '../../../server/services/afis/afis-types';
import { BagThemas } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import { Paragraph, UnorderedList } from '@amsterdam/design-system-react';
import { Datalist } from '../../components/Datalist/Datalist';
import { hasFailedDependency } from '../../../universal/helpers/api';

const pageContentTop = (
  <Paragraph>
    Hieronder kunt u uw facturatiegegevens inzien en een automatische incasso
    instellen per afdeling van de gemeente.
  </Paragraph>
);

type BusinessPartnerKey = keyof Omit<
  AfisBusinessPartnerDetailsTransformed,
  'addressId'
>;

const labels: Record<BusinessPartnerKey, string> = {
  businessPartnerId: 'Debiteurnummer',
  fullName: 'Naam',
  address: 'Adres',
  phone: 'Telefoonnummer',
  email: 'E-mailadres',
};

export default function AfisThemaPagina() {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted = AFIS?.content?.businessPartnerIdEncrypted;

  return (
    businessPartnerIdEncrypted && (
      <AfisBusinessPaginaContent
        businessPartnerIdEncrypted={businessPartnerIdEncrypted}
      />
    )
  );
}

function AfisBusinessPaginaContent({
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

  const failedEmail = hasFailedDependency(api.data, 'email');
  const failedPhone = hasFailedDependency(api.data, 'phone');

  return (
    <ThemaPagina
      title="AFIS"
      isError={false}
      isPartialError={failedEmail || failedPhone}
      errorAlertContent={
        <>
          De volgende gegevens konden niet worden opgehaald:
          {failedEmail && <><br>- Email</>}
          {failedPhone && <><br>- Telefoonnummer</>}
        </>
      }
      isLoading={false}
      linkListItems={[]}
      pageContentTop={pageContentTop}
      pageContentTables={
        <>
          {!!businesspartner && (
            <AfisBusinessPartner businesspartner={businesspartner} />
          )}
        </>
      }
    />
  );
}

type AfisBusinessPartnerProps = {
  businesspartner: AfisBusinessPartnerDetailsTransformed;
};

function AfisBusinessPartner({ businesspartner }: AfisBusinessPartnerProps) {
  const rows = Object.entries(labels).map(([key, label]) => {
    return {
      label,
      content: businesspartner[key as BusinessPartnerKey],
    };
  });

  return <Datalist rows={rows} />;
}
