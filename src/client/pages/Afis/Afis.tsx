import { useAppStateBagApi, useAppStateGetter } from '../../hooks/useAppState';
import { BFFApiUrls } from '../../config/api';
import { AfisBusinessPartnerKnownResponse } from '../../../server/services/afis/afis-types';
import { BagThemas } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import { Paragraph, UnorderedList } from '@amsterdam/design-system-react';
import { Datalist } from '../../components/Datalist/Datalist';
import {
  ApiResponse,
  hasFailedDependency,
} from '../../../universal/helpers/api';
import { ApiState } from '../../hooks/api/useDataApi';

const pageContentTop = (
  <Paragraph>
    Hieronder kunt u uw facturatiegegevens inzien en een automatische incasso
    instellen per afdeling van de gemeente.
  </Paragraph>
);

const labels: Record<string, string> = {
  businessPartnerId: 'Debiteurnummer',
  fullName: 'Naam',
  address: 'Adres',
  phone: 'Telefoonnummer',
  email: 'E-mailadres',
};

export default function AfisThemaPagina() {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted = AFIS?.content?.businessPartnerIdEncrypted;
  return businessPartnerIdEncrypted ? (
    <AfisBusinessPaginaContent
      businessPartnerIdEncrypted={businessPartnerIdEncrypted}
    />
  ) : null;
}

function AfisBusinessPaginaContent({
  businessPartnerIdEncrypted,
}: {
  businessPartnerIdEncrypted: string;
}) {
  const [businesspartner, api] =
    useAppStateBagApi<AfisBusinessPartnerKnownResponse>({
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
          <UnorderedList>
            {failedEmail && (
              <UnorderedList.Item>E-mailadres</UnorderedList.Item>
            )}
            {failedPhone && (
              <UnorderedList.Item>Telefoonnummer</UnorderedList.Item>
            )}
          </UnorderedList>
        </>
      }
      isLoading={false}
      linkListItems={[]}
      pageContentTop={pageContentTop ? pageContentTop : null}
      pageContentTables={
        <>
          {businesspartner && api && (
            <AfisBusinessPartner api={api} businesspartner={businesspartner} />
          )}
        </>
      }
    />
  );
}

type AfisBusinessPartnerProps = {
  api: ApiState<ApiResponse<AfisBusinessPartnerKnownResponse | null>>;
  businesspartner: AfisBusinessPartnerKnownResponse;
};

function AfisBusinessPartner({
  api,
  businesspartner,
}: AfisBusinessPartnerProps) {
  if (!api.isError && businesspartner) {
    const rows = Object.entries(businesspartner).map(([key, value]) => {
      if (key !== 'addressId') {
        return { label: labels[key], content: value };
      }
    });

    return <Datalist rows={rows} />;
  }
  return <></>;
}
