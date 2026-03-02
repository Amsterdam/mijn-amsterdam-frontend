import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router';
import slug from 'slugme';

import { themaConfig } from './Horeca-thema-config';
import { DOC_API_PATH, vergunning } from './Horeca.test';
import { HorecaDetail } from './HorecaDetail';
import { HorecaVergunningFrontend } from '../../../../server/services/horeca/decos-zaken';
import { bffApi } from '../../../../testing/utils';
import { AppState } from '../../../../universal/types/App.types';
import MockApp from '../../MockApp';

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
  const routeEntry = generatePath(themaConfig.detailPage.route.path, {
    caseType: slug(vergunning?.caseType, {
      lower: true,
    }),
    id: vergunning?.id as string,
  });
  const routePath = themaConfig.detailPage.route.path;

  return (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={HorecaDetail}
      state={testState}
    />
  );
}

describe('<HorecaDetail />', () => {
  test('DetailPagina should be rendered', () => {
    bffApi.get(DOC_API_PATH).reply(200, {
      content: [],
      status: 'OK',
    });
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
    bffApi.get(DOC_API_PATH).reply(200, {
      content: [],
      status: 'OK',
    });
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
