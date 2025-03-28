import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import slug from 'slugme';

import { HorecaDetailPagina } from './HorecaDetail';
import { HorecaVergunningFrontend } from '../../../server/services/horeca/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { vergunning } from './Horeca.test';
import { AppState } from '../../../universal/types';

const vergunning2: HorecaVergunningFrontend = {
  ...structuredClone(vergunning),
  decision: 'Verleend',
  processed: true,
  identifier: 'Z/24/2238079',
  id: 'Z-24-2238079',
};

const content: HorecaVergunningFrontend[] = [vergunning, vergunning2];

const testState = {
  HORECA: {
    status: 'OK',
    content,
  },
} as AppState;

function MockVergunningDetail({ identifier }: { identifier: string }) {
  const vergunning = content.find((v) => v.identifier === identifier);
  const routeEntry = generatePath(AppRoutes['HORECA/DETAIL'], {
    caseType: slug(vergunning?.caseType, {
      lower: true,
    }),
    id: vergunning?.id as string,
  });
  const routePath = AppRoutes['HORECA/DETAIL'];

  return (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={HorecaDetailPagina}
      initializeState={(snapshot: MutableSnapshot) => {
        snapshot.set(appStateAtom, testState);
      }}
    />
  );
}

describe('<HorecaDetail />', () => {
  describe('<ExploitatieHorecaBedrijf />', () => {
    test('DetailPagina should be rendered', () => {
      render(<MockVergunningDetail identifier="Z/24/2238078" />);
      expect(
        screen.getByText('Horeca vergunning exploitatie Horecabedrijf')
      ).toBeInTheDocument();
      expect(screen.getByText('Ontvangen')).toBeInTheDocument();
      expect(screen.getByText('In behandeling')).toBeInTheDocument();
      expect(screen.getByText('Afgehandeld')).toBeInTheDocument();
      expect(screen.getByText('Amstel 1 A 1011PN')).toBeInTheDocument();
    });

    test('DetailPagina with verleende vergunning should be rendered', () => {
      render(<MockVergunningDetail identifier="Z/24/2238079" />);
      expect(
        screen.getByText('Horeca vergunning exploitatie Horecabedrijf')
      ).toBeInTheDocument();
      expect(screen.getByText('Ontvangen')).toBeInTheDocument();
      expect(screen.getByText('In behandeling')).toBeInTheDocument();
      expect(screen.getByText('Afgehandeld')).toBeInTheDocument();
      expect(screen.getByText('Amstel 1 A 1011PN')).toBeInTheDocument();
      expect(screen.getByText('Verleend')).toBeInTheDocument();
    });
  });
});
