import { Heading, Link } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import {
  DatalistCanonsAfgekocht,
  DatalistCanonsNietAfgekocht,
} from './DatalistCanons';
import { ErfpachtDatalistProps } from './DatalistGeneral';
import {
  ErfpachtDossierDetailHuidigePeriode,
  ErfpachtDossierDetailToekomstigePeriode,
} from '../../../../../server/services/erfpacht/erfpacht-types';
import { defaultDateFormat } from '../../../../../universal/helpers/date';
import { Datalist, Row } from '../../../../components/Datalist/Datalist';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../../config/app';
import { LINKS } from '../Erfpacht-thema-config';
import styles from '../ErfpachtDetail.module.scss';

interface DatalistFinancieelPeriodeProps<T> {
  periode: T;
  titelAlgemeneBepaling: string;
  titelPeriodeVan: string;
  titelCanon: string;
  titelCanonTenTijdeVanAfkoop: string;
  isHuidigePeriode: boolean;
}

function DatalistFinancieelPeriode({
  periode,
  titelAlgemeneBepaling,
  titelPeriodeVan,
  titelCanon,
  titelCanonTenTijdeVanAfkoop,
  isHuidigePeriode,
}: DatalistFinancieelPeriodeProps<
  ErfpachtDossierDetailHuidigePeriode | ErfpachtDossierDetailToekomstigePeriode
>) {
  const rows: Row[] = [
    {
      label: titelAlgemeneBepaling,
      content: (
        <>
          <Link rel="noopener noreferrer" href={LINKS.algemeneBepalingen}>
            {periode.algemeneBepaling}
          </Link>{' '}
          - {periode.regime}
        </>
      ),
    },
  ];

  rows.push({
    label: periode.titelAfgekocht,
    content: periode.afgekocht,
  });

  if (
    periode.afgekocht === 'Nee' &&
    'titelBetalenVanaf' in periode &&
    periode.betalenVanaf
  ) {
    rows.push({
      label: periode.titelBetalenVanaf,
      content: defaultDateFormat(periode.betalenVanaf),
    });
  }

  if (periode.canons?.length && periode.afgekocht === 'Nee') {
    rows.push({
      label: titelCanon,
      content: <DatalistCanonsNietAfgekocht canons={periode.canons} />,
    });
  }

  if (periode.canons?.length && periode.afgekocht === 'Ja') {
    rows.push({
      label: titelCanonTenTijdeVanAfkoop,
      content: <DatalistCanonsAfgekocht canons={periode.canons} />,
    });
  }

  return (
    <div className={styles.DataListFinancieelPeriode}>
      <Heading
        level={3}
        className={classNames(styles.Section_heading, 'ams-mb-s')}
      >
        {titelPeriodeVan}:{' '}
        <span className={styles.periodeSamengesteld}>
          {periode.periodeSamengesteld}
        </span>
      </Heading>
      <Datalist rows={rows} />
    </div>
  );
}

function DatalistHuidigePeriode({ dossier }: ErfpachtDatalistProps) {
  if (dossier.financieel?.huidigePeriode) {
    return (
      <DatalistFinancieelPeriode
        titelAlgemeneBepaling={
          dossier.financieel.huidigePeriode.titelFinancieelAlgemeneBepaling
        }
        titelPeriodeVan={
          dossier.financieel.huidigePeriode.titelFinancieelPeriodeVan
        }
        titelCanon={dossier.financieel.huidigePeriode.titelFinancieelCanon}
        titelCanonTenTijdeVanAfkoop={
          dossier.financieel.huidigePeriode.titelCanonTenTijdeVanAfkoop
        }
        periode={dossier.financieel.huidigePeriode}
        isHuidigePeriode
      />
    );
  }
  return null;
}

function DatalistToekomstigePeriodes({ dossier }: ErfpachtDatalistProps) {
  return dossier.financieel?.toekomstigePeriodeList
    ?.slice(0, MAX_TABLE_ROWS_ON_THEMA_PAGINA)
    .map((periode) => (
      <DatalistFinancieelPeriode
        key={periode.titelFinancieelToekomstigeAlgemeneBepaling}
        titelAlgemeneBepaling={
          periode.titelFinancieelToekomstigeAlgemeneBepaling
        }
        titelPeriodeVan={periode.titelFinancieelToekomstigePeriodeVan}
        titelCanon={periode.titelFinancieelToekomstigeCanon}
        titelCanonTenTijdeVanAfkoop={periode.titelCanonTenTijdeVanAfkoop}
        periode={periode}
        isHuidigePeriode={false}
      />
    ));
}

export function DatalistsFinancieel({
  dossier,
  debiteurNummer,
}: ErfpachtDatalistProps) {
  return (
    <>
      <DatalistHuidigePeriode
        dossier={dossier}
        debiteurNummer={debiteurNummer}
      />
      <DatalistToekomstigePeriodes
        dossier={dossier}
        debiteurNummer={debiteurNummer}
      />
    </>
  );
}

export const forTesting = {
  DatalistFinancieelPeriode,
};
