import { Link } from '@amsterdam/design-system-react';

import { ErfpachtDatalistProps } from './DatalistGeneral';
import { Datalist } from '../../../../components/Datalist/Datalist';
import { LINKS } from '../Erfpacht-thema-config';

export function DatalistJuridisch({ dossier }: ErfpachtDatalistProps) {
  if (dossier.juridisch) {
    const rows = [
      {
        label: dossier.juridisch.titelAlgemeneBepaling,
        content: (
          <Link rel="noopener noreferrer" href={LINKS.algemeneBepalingen}>
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
