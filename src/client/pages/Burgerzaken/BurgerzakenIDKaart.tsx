// src/client/pages/Burgerzaken/BurgerZakenDetail.tsx
import { Grid } from '@amsterdam/design-system-react';

import { useBurgerZakenDetailData } from './useBurgerZakenDetailData.hook';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { IdentiteitsbewijsFrontend } from '../../../universal/types';
import { ThemaIcon } from '../../components';
import { Datalist } from '../../components/Datalist/Datalist';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

export function BurgerZakenIDKaart() {
  const { document, isLoading, isError, backLink } = useBurgerZakenDetailData();

  return (
    <ThemaDetailPagina<IdentiteitsbewijsFrontend>
      title={capitalizeFirstLetter(document?.documentType || 'Document')}
      zaak={document}
      isError={isError}
      isLoading={isLoading}
      icon={<ThemaIcon />}
      backLink={backLink}
      pageContentTop={
        !!document && <BurgerZakenIDKaartContent document={document} />
      }
    />
  );
}

function BurgerZakenIDKaartContent({
  document,
}: {
  document: IdentiteitsbewijsFrontend;
}) {
  const rows = getRows(document);

  return (
    <Grid.Cell span="all">
      <Datalist rows={rows} />
    </Grid.Cell>
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
      content: defaultDateFormat(document.datumUitgifte),
    },
    {
      label: 'Geldig tot',
      content: defaultDateFormat(document.datumAfloop),
    },
  ];
}
