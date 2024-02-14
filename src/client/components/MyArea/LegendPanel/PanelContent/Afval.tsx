import { LinkdInline } from '../../../Button/Button';
import GenericBase from './GenericBase';

const afvalUrls: Record<string, string> = {
  rest: 'https://www.amsterdam.nl/veelgevraagd/?productid=%7BC5AC6694-CB65-4ED8-B5B3-6794BEA279FD%7D',
  glas: 'https://www.amsterdam.nl/veelgevraagd/?productid=%7B881CBA8B-AB9F-43DF-910F-6B5DF7A91080%7D',
  papier:
    'https://www.amsterdam.nl/veelgevraagd/dit-mag-wel-en-niet-in-de-papiercontainer-944aa-kp',
  textiel:
    'https://www.amsterdam.nl/veelgevraagd/?caseid=%7BD68460AA-EB08-4132-A69F-7763CD8431A2%7D',
  gft: 'https://www.amsterdam.nl/veelgevraagd/?caseid=%7B4FDB05A6-EA6F-4475-A359-C19AD3578CF5%7D',
  brood:
    'https://www.amsterdam.nl/veelgevraagd/?caseid=%7B901ECC99-7B1F-40E8-9C6C-5CD95AC256E1%7D',
};

interface MyArePanelContentAfvalProps {
  panelItem: any;
  datasetId: string;
}

export default function MyArePanelContentAfval({
  datasetId,
  panelItem,
}: MyArePanelContentAfvalProps) {
  const infoUrl =
    panelItem.fractieOmschrijving &&
    afvalUrls[panelItem.fractieOmschrijving.toLowerCase()];
  return (
    <GenericBase
      title={panelItem.fractieOmschrijving || panelItem.serienummer}
      supTitle="Afvalcontainers"
    >
      {!panelItem.geadopteerdInd &&
        panelItem.fractieOmschrijving &&
        // You can't adopt a Kerstboom inzamellocatie
        !panelItem.fractieOmschrijving.startsWith('Kerst') && (
          <p>
            Deze container kunt u adopteren!
            <br />{' '}
            <LinkdInline
              external={true}
              href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BA6316561-BBC0-42A0-810F-74A7CCFA188D%7D"
            >
              Lees hier hoe
            </LinkdInline>
          </p>
        )}
      {!!infoUrl && (
        <p>
          Wat mag er{' '}
          <LinkdInline external={true} href={infoUrl}>
            niet
          </LinkdInline>{' '}
          in de container?
        </p>
      )}
    </GenericBase>
  );
}
