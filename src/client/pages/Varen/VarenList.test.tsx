import { render, within } from '@testing-library/react';
import Mockdate from 'mockdate';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  VarenFrontend,
  VarenVergunningExploitatieType,
} from '../../../server/services/varen/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { jsonCopy } from '../../../universal/helpers/utils';
import { AppState } from '../../../universal/types/App.types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { VarenList } from './VarenList';

type ExploitatieAanvraag = VarenFrontend<VarenVergunningExploitatieType>;
const exploitatieDecision: ExploitatieAanvraag = {
  id: 'Z-24-0000001',
  identifier: 'Z/24/0000001',
  caseType: 'Varen vergunning exploitatie',
  title: 'Varen vergunning exploitatie',
  status: 'Besluit',
  decision: 'Verleend',
  processed: true,
  vesselName: 'BootjeVanBerend',
  dateDecisionFormatted: '10 november 2023',
  link: {
    to: '/passagiers-en-beroepsvaart/vergunning/varen-vergunning-exploitatie/Z-24-0000001',
    title: 'Bekijk hoe het met uw aanvraag staat',
  },
} as unknown as ExploitatieAanvraag;

const varenContent: AppState['VAREN']['content'] = [exploitatieDecision];

const getTestState = (content: VarenFrontend[] = varenContent): AppState =>
  jsonCopy({
    VAREN: {
      content: content,
      status: 'OK',
    },
  });

function initializeState(snapshot: MutableSnapshot, state: AppState) {
  snapshot.set(appStateAtom, state);
}

describe('<VarenList />', () => {
  function Component({ state }: { state: AppState }) {
    return (
      <MockApp
        routePath={AppRoutes['VAREN/LIST']}
        routeEntry={generatePath(AppRoutes['VAREN/LIST'], {
          kind: 'actieve-vergunningen',
          page: 1,
        })}
        component={VarenList}
        initializeState={(snap) => initializeState(snap, state)}
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
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Actieve vergunningen'
    );
  });

  it('Shows the expected rows in the tables', () => {
    const vergunningen = [
      exploitatieDecision,
      exploitatieDecision,
      exploitatieDecision,
      exploitatieDecision,
    ].map((vergunning, index) => ({
      ...vergunning,
      id: `${index}`,
    }));
    const screen = render(<Component state={getTestState(vergunningen)} />);

    const table = within(screen.getByRole('table'));

    const columnHeaders = table.getAllByRole('columnheader');
    expect(columnHeaders.map((h) => h.textContent)).toMatchObject([
      'Naam vaartuig',
      'Omschrijving',
      'Datum besluit',
      'Resultaat',
    ]);

    expect(table.getAllByText('BootjeVanBerend')).toHaveLength(
      vergunningen.length
    );
    expect(table.getAllByText('Varen vergunning exploitatie')).toHaveLength(
      vergunningen.length
    );
    expect(table.getAllByText('10 november 2023')).toHaveLength(
      vergunningen.length
    );
    expect(table.getAllByText('Verleend')).toHaveLength(vergunningen.length);
  });

  it('Naam vaartuig links to the corresponding aanvraag or vergunning', () => {
    const screen = render(
      <Component state={getTestState([exploitatieDecision])} />
    );

    expect(
      screen.getByRole('link', { name: 'BootjeVanBerend' }).getAttribute('href')
    ).toContain('Z-24-0000001');
  });
});
