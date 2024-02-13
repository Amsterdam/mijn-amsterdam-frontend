import { Heading, Link } from '@amsterdam/design-system-react';
import {
  ErfpachtDossierDetailHuidigePeriode,
  ErfpachtDossierDetailToekomstigePeriode,
} from '../../../../server/services/simple-connect/erfpacht';
import { Datalist } from '../../../components/Datalist/Datalist';
import { DatalistCanons } from './DatalistCanons';
import { ErfpachtDatalistProps } from './DatalistGeneral';
import styles from './ErfpachtDossierDetail.module.scss';

interface DatalistFinancieelPeriodeProps<T> {
  periode: T;
}

function DatalistFinancieelPeriode({
  periode,
}: DatalistFinancieelPeriodeProps<ErfpachtDossierDetailHuidigePeriode>) {
  const rows = [
    {
      label: periode.titelFinancieelAlgemeneBepaling,
      content: (
        <Link
          rel="noopener noreferrer"
          href="https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/algemene-bepalingen/"
        >
          {periode.algemeneBepaling}
        </Link>
      ),
    },
    {
      label: periode.titelAfgekocht,
      content: periode.afgekocht,
    },
    {
      label: periode.titelFinancieelCanon,
      content: <DatalistCanons canons={periode.canons} />,
    },
  ];
  return (
    <>
      <Heading level={3} size="level-4" className={styles.Section_heading}>
        {periode.titelFinancieelPeriodeVan}: {periode.periodeSamengesteld}
      </Heading>
      <Datalist rows={rows} />
    </>
  );
}

function DatalistHuidigePeriode({ dossier }: ErfpachtDatalistProps) {
  if (dossier.financieel?.huidigePeriode) {
    return (
      <DatalistFinancieelPeriode periode={dossier.financieel.huidigePeriode} />
    );
  }
  return null;
}
function DatalistToekomstigePeriode({
  periode,
}: DatalistFinancieelPeriodeProps<ErfpachtDossierDetailToekomstigePeriode>) {
  const rows = [
    {
      label: periode.titelFinancieelToekomstigeAlgemeneBepaling,
      content: (
        <Link
          rel="noopener noreferrer"
          href="https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/algemene-bepalingen/"
        >
          {periode.algemeneBepaling}
        </Link>
      ),
    },
    {
      label: periode.titelAfgekocht,
      content: periode.afgekocht,
    },
    {
      label: periode.titelFinancieelToekomstigeCanon,
      content: <DatalistCanons canons={periode.canons} />,
    },
  ];
  return (
    <>
      <Heading level={3} className={styles.Section_heading}>
        {periode.titelFinancieelToekomstigePeriodeVan}{' '}
        {periode.periodeSamengesteld}
      </Heading>
      <Datalist rows={rows} />
    </>
  );
}

function DatalistToekomstigePeriodes({ dossier }: ErfpachtDatalistProps) {
  return dossier.financieel?.toekomstigePeriodeList?.map((periode) => (
    <DatalistToekomstigePeriode periode={periode} />
  ));
}

export function DatalistsFinancieel({ dossier }: ErfpachtDatalistProps) {
  return (
    <>
      <DatalistHuidigePeriode dossier={dossier} />
      <DatalistToekomstigePeriodes dossier={dossier} />
    </>
  );
}
