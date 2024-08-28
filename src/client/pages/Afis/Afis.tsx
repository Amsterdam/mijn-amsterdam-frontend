import { useAppStateBagApi, useAppStateGetter } from '../../hooks/useAppState';
import { BFFApiUrls } from '../../config/api';
import { AfisBusinessPartnerDetailsTransformed } from '../../../server/services/afis/afis-types';
import { BagThemas } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import { Paragraph } from '@amsterdam/design-system-react';
import { hasFailedDependency, isError } from '../../../universal/helpers/api';
import { AppRoutes } from '../../../universal/config/routes';

const pageContentTop = (
  <Paragraph>
    Hieronder kunt u uw facturatiegegevens inzien en een automatische incasso
    instellen per afdeling van de gemeente.
  </Paragraph>
);

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
  const [_, api] =
    useAppStateBagApi<AfisBusinessPartnerDetailsTransformed | null>({
      url: `${BFFApiUrls.AFIS_BUSINESSPARTNER}/${businessPartnerIdEncrypted}`,
      bagThema: BagThemas.AFIS,
      key: businessPartnerIdEncrypted,
    });

  const hasError = isError(api.data);
  const failedEmail = hasFailedDependency(api.data, 'email');
  const failedPhone = hasFailedDependency(api.data, 'phone');

  return (
    <ThemaPagina
      title="AFIS"
      buttonLinkItems={[
        { to: AppRoutes.AFIS_BETAALVOORKEUREN, title: 'Betaal voorkeuren' },
      ]}
      isError={hasError}
      isPartialError={failedEmail || failedPhone}
      errorAlertContent={
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
        </>
      }
      isLoading={false}
      linkListItems={
        [
          // {
          //   to: 'https://www.amsterdam.nl/ondernemen/afis/facturen/',
          //   title: 'Meer over facturen van de gemeente',
          // },
          // Deze pagina moet nog gemaakt worden
        ]
      }
      pageContentTop={pageContentTop}
      pageContentTables={null}
    />
  );
}
