import { Heading } from '@amsterdam/design-system-react';
import {
  ErfpachtDossierDetailHuidigePeriode,
  ErfpachtDossierDetailToekomstigePeriode,
} from '../../../../server/services/simple-connect/erfpacht';
import { DataList } from '../../../components/DataList/DataList';
import { ErfpachtDataListProps } from './DataListGeneral';
import { DataListCanons } from './DataListcanons';
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
      content: periode.algemeneBepaling,
    },
    {
      label: periode.titelAfgekocht,
      content: periode.afgekocht,
    },
    {
      label: periode.titelFinancieelCanon,
      content: <DataListCanons canons={periode.canons} />,
    },
  ];
  return (
    <>
      <Heading level={3} className={styles.Section_heading}>
        {periode.titelFinancieelPeriodeVan} {periode.periodeSamengesteld}
      </Heading>
      <DataList rows={rows} />
    </>
  );
}

function DataListHuidigePeriode({ dossier }: ErfpachtDataListProps) {
  if (dossier.financieel?.huidigePeriode) {
    return (
      <DatalistFinancieelPeriode periode={dossier.financieel.huidigePeriode} />
    );
  }
  return null;
}
function DataListToekomstigePeriode({
  periode,
}: DatalistFinancieelPeriodeProps<ErfpachtDossierDetailToekomstigePeriode>) {
  const rows = [
    {
      label: periode.titelFinancieelToekomstigeAlgemeneBepaling,
      content: periode.algemeneBepaling,
    },
    {
      label: periode.titelAfgekocht,
      content: periode.afgekocht,
    },
    {
      label: periode.titelFinancieelToekomstigeCanon,
      content: <DataListCanons canons={periode.canons} />,
    },
  ];
  return (
    <>
      <Heading level={3} className={styles.Section_heading}>
        {periode.titelFinancieelToekomstigePeriodeVan}{' '}
        {periode.periodeSamengesteld}
      </Heading>
      <DataList rows={rows} />
    </>
  );
}

function DataListToekomstigePeriodes({ dossier }: ErfpachtDataListProps) {
  return dossier.financieel?.toekomstigePeriodeList?.map((periode) => (
    <DataListToekomstigePeriode periode={periode} />
  ));
}

export function DataListsFinancieel({ dossier }: ErfpachtDataListProps) {
  return (
    <>
      <DataListHuidigePeriode dossier={dossier} />
      <DataListToekomstigePeriodes dossier={dossier} />
    </>
  );
}
