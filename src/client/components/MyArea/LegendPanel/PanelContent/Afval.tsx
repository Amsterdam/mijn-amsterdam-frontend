import { Link, Paragraph } from '@amsterdam/design-system-react';

import GenericBase from './GenericBase';

const afvalUrls: Record<string, string> = {
  rest: 'https://www.milieucentraal.nl/minder-afval/afval-scheiden/restafval',
  glas: 'https://www.milieucentraal.nl/minder-afval/afval-scheiden/glas-potten-flessen-en-ander-glas',
  papier:
    'https://www.milieucentraal.nl/minder-afval/afval-scheiden/papier-en-karton',
  textiel:
    'https://www.milieucentraal.nl/minder-afval/afval-scheiden/kleding-textiel-en-schoenen',
  gft: 'https://www.milieucentraal.nl/minder-afval/afval-scheiden/groente-fruit-en-tuinafval-gft/#uitgebreide-gft-lijst-per-categorie',
};

interface MyArePanelContentAfvalProps {
  panelItem: Record<string, string>;
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
          <Paragraph>
            Deze container kunt u adopteren!
            <br />{' '}
            <Link
              rel="noopener noreferrer"
              href="https://www.amsterdam.nl/veelgevraagd/ondergrondse-afvalcontainer-adopteren-a188d"
            >
              Lees hier hoe
            </Link>
          </Paragraph>
        )}
      {!!infoUrl && (
        <Paragraph>
          Wat mag er{' '}
          <Link rel="noopener noreferrer" href={infoUrl}>
            niet
          </Link>{' '}
          in de container?
        </Paragraph>
      )}
    </GenericBase>
  );
}
