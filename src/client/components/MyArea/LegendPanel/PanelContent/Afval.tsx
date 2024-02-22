import { LinkdInline } from '../../../Button/Button';
import GenericBase from './GenericBase';

const afvalUrls: Record<string, string> = {
  rest: 'https://www.amsterdam.nl/veelgevraagd/huisvuil-279fd',
  glas: 'https://www.amsterdam.nl/veelgevraagd/glas-inleveren-in-de-glasbak-91080',
  papier:
    'https://www.amsterdam.nl/veelgevraagd/dit-mag-wel-en-niet-in-de-papiercontainer-944aa-kp',
  textiel:
    'https://www.amsterdam.nl/veelgevraagd/textielcontainers-431a2-kp',
  gft: 'https://www.amsterdam.nl/veelgevraagd/dit-mag-wel-en-niet-bij-het-groente-fruit-etensresten-en-tuinafval-gfe-t-78cf5-kp',
  brood:
    'https://www.amsterdam.nl/veelgevraagd/wat-mag-er-in-de-broodcontainer-256e1-kp',
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
              href="https://www.amsterdam.nl/veelgevraagd/ondergrondse-afvalcontainer-adopteren-a188d"
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
