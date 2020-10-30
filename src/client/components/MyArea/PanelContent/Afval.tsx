import React from 'react';
import InfoDetail from '../../InfoDetail/InfoDetail';
import GenericBase from './GenericBase';
import { LinkdInline } from '../../Button/Button';
import Url from './Url';

const afvalUrls: Record<string, string> = {
  rest:
    'https://www.amsterdam.nl/veelgevraagd/?productid=%7BC5AC6694-CB65-4ED8-B5B3-6794BEA279FD%7D',
  glas:
    'https://www.amsterdam.nl/veelgevraagd/?productid=%7B881CBA8B-AB9F-43DF-910F-6B5DF7A91080%7D',
  plastic:
    'https://www.amsterdam.nl/veelgevraagd/?productid=%7B3B03E107-63EC-40D0-B2E8-92BCCCE0B91A%7D',
  papier:
    'https://www.amsterdam.nl/veelgevraagd/?productid=%7B95B69586-623A-4333-9322-A48FF8424B77%7D',
  textiel:
    'https://www.amsterdam.nl/veelgevraagd/?caseid=%7BD68460AA-EB08-4132-A69F-7763CD8431A2%7D',
};

interface MyArePanelContentAfvalProps {
  panelItem: any;
  datasetId: string;
}

export default function MyArePanelContentAfval({
  datasetId,
  panelItem,
}: MyArePanelContentAfvalProps) {
  const adoptedText = panelItem.geadopteerdInd ? (
    'Ja'
  ) : (
    <>
      Nee.{' '}
      <LinkdInline
        external={true}
        href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BA6316561-BBC0-42A0-810F-74A7CCFA188D%7D"
      >
        Adopteer deze container
      </LinkdInline>
      .
    </>
  );
  return (
    <GenericBase
      title={panelItem.fractieOmschrijving}
      supTitle="Afvalcontainers"
    >
      <InfoDetail label="Afvalcontainer geadopteerd?" value={adoptedText} />
      <Url url={afvalUrls[panelItem.fractieOmschrijving.toLowerCase()]} />
    </GenericBase>
  );
}
