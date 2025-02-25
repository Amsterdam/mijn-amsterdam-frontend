import { Link } from '@amsterdam/design-system-react';

import { ErfpachtDatalistProps } from './DatalistGeneral';
import { Datalist } from '../../../components/Datalist/Datalist';

export function DatalistJuridisch({ dossier }: ErfpachtDatalistProps) {
  if (dossier.juridisch) {
    const rows = [
      {
        label: dossier.juridisch.titelAlgemeneBepaling,
        content: (
          <Link
            rel="noopener noreferrer"
            href="https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/algemene-bepalingen/"
          >
            {dossier.juridisch.algemeneBepaling}
          </Link>
        ),
      },
      {
        label: dossier.juridisch.titelIngangsdatum,
        content: dossier.juridisch.ingangsdatum,
      },
      {
        label: dossier.juridisch.titelSoortErfpacht,
        content: dossier.juridisch.uitgeschrevenSoortErfpacht,
      },
    ];
    return <Datalist rows={rows} />;
  }
  return null;
}
