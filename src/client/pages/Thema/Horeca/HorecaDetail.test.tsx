import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';
import slug from 'slugme';

import { routeConfig } from './Horeca-thema-config.ts';
import { vergunning } from './Horeca.test.tsx';
import { HorecaDetail } from './HorecaDetail.tsx';
import { HorecaVergunningFrontend } from '../../../../server/services/horeca/decos-zaken.ts';
import { AppState } from '../../../../universal/types/App.types.ts';
import { appStateAtom } from '../../../hooks/useAppState.ts';
import MockApp from '../../MockApp.tsx';

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
  const routeEntry = generatePath(routeConfig.detailPage.path, {
    caseType: slug(vergunning?.caseType, {
      lower: true,
    }),
    id: vergunning?.id as string,
  });
  const routePath = routeConfig.detailPage.path;

  return (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={HorecaDetail}
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
        screen.getByRole('heading', {
          name: 'Horeca vergunning exploitatie Horecabedrijf',
        })
      ).toBeInTheDocument();
      expect(screen.getByText('Ontvangen')).toBeInTheDocument();
      expect(screen.getByText('In behandeling')).toBeInTheDocument();
      expect(screen.getByText('Afgehandeld')).toBeInTheDocument();
      expect(screen.getByText('Amstel 1 A 1011PN')).toBeInTheDocument();
    });

    test('DetailPagina with verleende vergunning should be rendered', () => {
      render(<MockVergunningDetail identifier="Z/24/2238079" />);
      expect(
        screen.getByRole('heading', {
          name: 'Horeca vergunning exploitatie Horecabedrijf',
        })
      ).toBeInTheDocument();
      expect(screen.getByText('Ontvangen')).toBeInTheDocument();
      expect(screen.getByText('In behandeling')).toBeInTheDocument();
      expect(screen.getByText('Afgehandeld')).toBeInTheDocument();
      expect(screen.getByText('Amstel 1 A 1011PN')).toBeInTheDocument();
      expect(screen.getByText('Verleend')).toBeInTheDocument();
    });
  });
});
