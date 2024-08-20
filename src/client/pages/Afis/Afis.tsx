import { useAppStateBagApi, useAppStateGetter } from '../../hooks/useAppState';
import { BFFApiUrls } from '../../config/api';
import { BusinessPartnerKnownResponse } from '../../../server/services/afis/afis-types';
import { BagThemas } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import { Paragraph } from '@amsterdam/design-system-react';
import { Datalist } from '../../components/Datalist/Datalist';

const pageContentTop = (
  <Paragraph>
    Hieronder kunt u uw facturatiegegevens inzien en een automatische incasso
    instellen per afdeling van de gemeente.
  </Paragraph>
);

export default function AfisThemaPagina() {
  const { AFIS } = useAppStateGetter();

  return (
    <ThemaPagina
      title="AFIS"
      isError={false}
      isLoading={false}
      linkListItems={[]}
      pageContentTop={pageContentTop ? pageContentTop : null}
      pageContentTables={
        <>
          {AFIS.content?.businessPartnerIdEncrypted && (
            <AfisBusinessPartner
              businessPartnerIdEncrypted={
                AFIS.content.businessPartnerIdEncrypted
              }
            />
          )}
        </>
      }
    />
  );
}

type AfisBusinessPartnerProps = {
  businessPartnerIdEncrypted: BusinessPartnerKnownResponse['businessPartnerIdEncrypted'];
};

function AfisBusinessPartner({
  businessPartnerIdEncrypted,
}: AfisBusinessPartnerProps) {
  const [businesspartner, api] =
    useAppStateBagApi<BusinessPartnerKnownResponse>({
      url: `${BFFApiUrls.AFIS_BUSINESSPARTNER}/${businessPartnerIdEncrypted}`,
      bagThema: BagThemas.AFIS,
      key: businessPartnerIdEncrypted || '',
    });

  if (!api.isError && businesspartner) {
    const labels: Record<string, string> = {
      BusinessPartner: 'Debiteurnummer',
      BusinessPartnerFullName: 'Naam',
      BusinessPartnerAddress: 'Adres',
      PhoneNumber: 'Telefoonnummer',
      EmailAddress: 'E-mailadres',
    };

    const rows = Object.entries(businesspartner).map(([key, value]) => {
      return { label: labels[key], content: value };
    });

    return <Datalist rows={rows} />;
  }
}
