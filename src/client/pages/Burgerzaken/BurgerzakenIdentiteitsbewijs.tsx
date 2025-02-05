// src/client/pages/Burgerzaken/BurgerZakenDetail.tsx

import { useBurgerZakenDetailData } from './useBurgerZakenDetailData.hook';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { IdentiteitsbewijsFrontend } from '../../../universal/types';
import { Datalist } from '../../components/Datalist/Datalist';
import { PageContentCell } from '../../components/Page/Page';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

export function BurgerzakenIdentiteitsbewijs() {
  const { document, isLoading, isError, backLink } = useBurgerZakenDetailData();

  return (
    <ThemaDetailPagina<IdentiteitsbewijsFrontend>
      title={capitalizeFirstLetter(
        document?.documentType || 'Identiteitsbewijs'
      )}
      zaak={document}
      isError={isError}
      isLoading={isLoading}
      backLink={backLink}
      pageContentTop={
        !!document && (
          <BurgerzakenIdentiteitsbewijsContent document={document} />
        )
      }
    />
  );
}

function BurgerzakenIdentiteitsbewijsContent({
  document,
}: {
  document: IdentiteitsbewijsFrontend;
}) {
  const rows = getRows(document);

  return (
    <PageContentCell>
      <Datalist rows={rows} />
    </PageContentCell>
  );
}

function getRows(document: IdentiteitsbewijsFrontend) {
  return [
    {
      label: 'Documentnummer',
      content: document.documentNummer,
    },
    {
      label: 'Datum uitgifte',
      content: document.datumUitgifteFormatted,
    },
    {
      label: 'Geldig tot',
      content: document.datumAfloopFormatted,
    },
  ];
}
