import { render, within } from '@testing-library/react';
import Mockdate from 'mockdate';
import { generatePath } from 'react-router';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { routeConfig } from './Varen-thema-config';
import { VarenList } from './VarenList';
import {
  VarenVergunningFrontend,
  VarenZakenFrontend,
  ZaakVergunningExploitatieType,
} from '../../../../server/services/varen/config-and-types';
import { jsonCopy } from '../../../../universal/helpers/utils';
import { AppState } from '../../../../universal/types/App.types';
import { expectHeaders } from '../../../helpers/test-utils';
import MockApp from '../../MockApp';

type ExploitatieAanvraag = VarenZakenFrontend<ZaakVergunningExploitatieType>;
const exploitatieInProgress: ExploitatieAanvraag = {
  id: 'Z-24-0000001',
  identifier: 'Z/24/0000001',
  caseType: 'Varen vergunning exploitatie',
  title: 'Varen vergunning exploitatie',
  displayStatus: 'In behandeling',
  decision: null,
  processed: false,
  vesselName: 'BootjeVanBerend',
  dateRequestFormatted: '10 november 2023',
  dateDecisionFormatted: null,
  link: {
    to: '/varen/zaak/varen-vergunning-exploitatie/Z-24-0000001',
    title: 'Bekijk hoe het met uw aanvraag staat',
  },
} as unknown as ExploitatieAanvraag;

const vergunning: VarenVergunningFrontend = {
  id: 'Z-24-0000001',
  identifier: 'Z/24/0000001',
  title: 'Varen vergunning exploitatie',
  vesselName: 'BootjeVanBerend',
  dateRequestFormatted: '08 november 2023',
  dateStartFormatted: '10 november 2023',
  link: {
    to: '/varen/vergunning/Z-24-0000001',
    title: 'Bekijk uw actieve vergunning',
  },
} as unknown as VarenVergunningFrontend;

const getTestState = (
  zaken: VarenZakenFrontend[] = [exploitatieInProgress],
  vergunningen: VarenVergunningFrontend[] = [vergunning]
): AppState =>
  jsonCopy({
    VAREN: {
      content: {
        reder: {},
        zaken,
        vergunningen,
      },
      status: 'OK',
    },
  });

describe('<VarenList />', () => {
  function Component({ state }: { state: AppState }) {
    return (
      <MockApp
        routePath={routeConfig.listPage.path}
        routeEntry={generatePath(routeConfig.listPage.path, {
          kind: 'lopende-aanvragen',
          page: '1',
        })}
        component={VarenList}
        state={state}
      />
    );
  }

  beforeAll(() => {
    Mockdate.set('2025-03-04');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  it('Shows the expected title on the page', () => {
    const screen = render(<Component state={getTestState([])} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Lopende aanvragen'
    );
  });

  it('Shows the expected rows in the tables', () => {
    const vergunningen = [
      exploitatieInProgress,
      exploitatieInProgress,
      exploitatieInProgress,
      exploitatieInProgress,
    ].map((vergunning, index) => ({
      ...vergunning,
      id: `${index}`,
    }));
    const screen = render(<Component state={getTestState(vergunningen)} />);

    const table = screen.getByRole('table');
    expectHeaders(table, [
      'Naam vaartuig',
      'Omschrijving',
      'Datum aanvraag',
      'Status',
    ]);

    const withinTable = within(table);
    expect(withinTable.getAllByText('BootjeVanBerend')).toHaveLength(
      vergunningen.length
    );
    expect(
      withinTable.getAllByText('Varen vergunning exploitatie')
    ).toHaveLength(vergunningen.length);
    expect(withinTable.getAllByText('10 november 2023')).toHaveLength(
      vergunningen.length
    );
    expect(withinTable.getAllByText('In behandeling')).toHaveLength(
      vergunningen.length
    );
  });

  it('Naam vaartuig links to the corresponding aanvraag or vergunning', () => {
    const screen = render(
      <Component state={getTestState([exploitatieInProgress])} />
    );

    expect(
      screen.getByRole('link', { name: 'BootjeVanBerend' }).getAttribute('href')
    ).toContain('Z-24-0000001');
  });
});

describe('<VarenVergunningList />', () => {
  function Component({ state }: { state: AppState }) {
    return (
      <MockApp
        routePath={routeConfig.listPage.path}
        routeEntry={generatePath(routeConfig.listPage.path, {
          kind: 'actieve-vergunningen',
          page: '1',
        })}
        component={VarenList}
        state={state}
      />
    );
  }

  beforeAll(() => {
    Mockdate.set('2025-03-04');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  it('Shows the expected title on the page', () => {
    const screen = render(<Component state={getTestState([])} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Actieve vergunningen'
    );
  });

  it('Shows the expected rows in the tables', () => {
    const vergunningen = [vergunning, vergunning, vergunning, vergunning].map(
      (vergunning, index) => ({
        ...vergunning,
        id: `${index}`,
      })
    );
    const screen = render(<Component state={getTestState([], vergunningen)} />);

    const table = screen.getByRole('table');
    expectHeaders(table, [
      'Naam vaartuig',
      'Omschrijving',
      'Vergunningkenmerk',
    ]);

    const withinTable = within(table);

    expect(withinTable.getAllByText('BootjeVanBerend')).toHaveLength(
      vergunningen.length
    );
    expect(
      withinTable.getAllByText('Varen vergunning exploitatie')
    ).toHaveLength(vergunningen.length);
  });

  it('Naam vaartuig links to the corresponding aanvraag or vergunning', () => {
    const screen = render(
      <Component state={getTestState([exploitatieInProgress])} />
    );

    expect(
      screen.getByRole('link', { name: 'BootjeVanBerend' }).getAttribute('href')
    ).toContain('Z-24-0000001');
  });
});
