import { ErfpachtV2DossiersDetail } from '../../../../server/services/simple-connect/erfpacht';
import { DataList } from '../../../components/DataList/DataList';
import { ErfpachtersList } from './ErfpachtersList';
import { KadastraleAanduidingList } from './KadastraleAanduidingList';

export interface ErfpachtDataListProps {
  dossier: ErfpachtV2DossiersDetail;
}

export function DataListGeneral({ dossier }: ErfpachtDataListProps) {
  const rows = [
    {
      label: dossier.titelDossierNummer,
      content: dossier.dossierNummer,
    },
    {
      label: dossier.titelVoorkeursadres,
      content: dossier.voorkeursadres,
    },
    {
      label: dossier.titelKadastraleaanduiding,
      content: (
        <KadastraleAanduidingList
          kadastraleaanduidingen={dossier.kadastraleaanduidingen}
        />
      ),
    },
    {
      label: dossier.titelEersteUitgifte,
      content: dossier.eersteUitgifte,
    },
    {
      label: dossier.titelKopErfpachter,
      content: <ErfpachtersList erfpachters={dossier.relaties} />,
    },
  ];

  return <DataList rows={rows} />;
}
