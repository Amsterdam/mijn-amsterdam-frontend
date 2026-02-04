import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { forTesting } from './DatalistsFinancieel';
import type {
  ErfpachtDossierDetailHuidigePeriode,
  ErfpachtDossierDetailToekomstigePeriode,
} from '../../../../../server/services/erfpacht/erfpacht-types';

const { DatalistFinancieelPeriode } = forTesting;

describe('DatalistFinancieelPeriode', () => {
  it('renders afgekocht canon correctly', () => {
    const mockPeriode: ErfpachtDossierDetailHuidigePeriode = {
      periodeVan: '2020',
      titelFinancieelPeriodeVan: 'Periode Van',
      periodeTm: '2025',
      periodeSamengesteld: '2020-2025',
      algemeneBepaling: 'Algemene Bepaling Content',
      titelFinancieelAlgemeneBepaling: 'Algemene Bepaling',
      regime: 'Regime Content',
      titelFinancieelRegime: 'Regime',
      afgekocht: 'Ja',
      titelAfgekocht: 'Afgekocht',
      titelGeenCanon: 'Geen Canon',
      titelFinancieelCanon: 'Canon',
      titelCanonTenTijdeVanAfkoop: 'Canon Afkoop',
      canons: [
        {
          canonBedrag: '1000',
          canonBeginJaar: '1999',
          canonBedragBijAfkoop: '5000',
          formattedCanonBedragBijAfkoop: '€5.000',
        },
      ],
    };

    const { asFragment } = render(
      <DatalistFinancieelPeriode
        periode={mockPeriode}
        titelAlgemeneBepaling="Algemene Bepaling"
        titelPeriodeVan="Periode Van"
        titelCanon="Canon"
        titelCanonTenTijdeVanAfkoop="Canon Afkoop"
        isHuidigePeriode={true}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders niet afgekocht canon correctly', () => {
    const mockPeriode: ErfpachtDossierDetailToekomstigePeriode = {
      periodeVan: '2025',
      titelFinancieelToekomstigePeriodeVan: 'Periode Van',
      periodeTm: '2030',
      periodeSamengesteld: '2025-2030',
      algemeneBepaling: 'Algemene Bepaling Content',
      titelFinancieelToekomstigeAlgemeneBepaling: 'Algemene Bepaling',
      regime: 'Regime Content',
      titelFinancieelToekomstigeRegime: 'Regime',
      afgekocht: 'Nee',
      titelAfgekocht: 'Afgekocht',
      betalenVanaf: '2025-01-01',
      titelBetalenVanaf: 'Betalen Vanaf',
      titelFinancieelToekomstigeCanon: 'Canon',
      titelCanonTenTijdeVanAfkoop: 'Canon Afkoop',
      canons: [
        {
          canonBedrag: '2000',
          formattedCanonBedrag: '€2.000',
          canonBeginJaar: '2005',
          samengesteld: 'Canon samengesteld',
        },
      ],
    };

    const { asFragment } = render(
      <DatalistFinancieelPeriode
        periode={mockPeriode}
        titelAlgemeneBepaling="Algemene Bepaling"
        titelPeriodeVan="Periode Van"
        titelCanon="Canon"
        titelCanonTenTijdeVanAfkoop="Canon Afkoop"
        isHuidigePeriode={false}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
