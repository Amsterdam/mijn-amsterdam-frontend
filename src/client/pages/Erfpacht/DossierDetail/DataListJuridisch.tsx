import { Link } from '@amsterdam/design-system-react';
import { DataList } from '../../../components/DataList/DataList';
import { ErfpachtDataListProps } from './DataListGeneral';

export function DataListJuridisch({ dossier }: ErfpachtDataListProps) {
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
    return <DataList rows={rows} />;
  }
  return null;
}
