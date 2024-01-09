import { Link } from '@amsterdam/design-system-react';
import { Datalist } from '../../../components/Datalist/Datalist';
import { ErfpachtDatalistProps } from './DatalistGeneral';

export function DatalistJuridisch({ dossier }: ErfpachtDatalistProps) {
  if (dossier.juridisch) {
    const rows = [
      {
        label: dossier.juridisch.titelAlgemeneBepaling,
        content: <Link href="">{dossier.juridisch.algemeneBepaling}</Link>,
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
