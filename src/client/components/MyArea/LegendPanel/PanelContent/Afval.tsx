import { Link } from '@amsterdam/design-system-react';

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
  panelItem: {
    fractieOmschrijving: string;
    serienummer: string;
    geadopteerdInd: boolean;
  };
}

export default function MyArePanelContentAfval({
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
            <Link
              variant="inline"
              href="https://www.amsterdam.nl/veelgevraagd/ondergrondse-afvalcontainer-adopteren-a188d"
            >
              Lees hier hoe
            </Link>
          </p>
        )}
      {!!infoUrl && (
        <p>
          Wat mag er{' '}
          <Link variant="inline" href={infoUrl}>
            niet
          </Link>{' '}
          in de container?
        </p>
      )}
    </GenericBase>
  );
}
