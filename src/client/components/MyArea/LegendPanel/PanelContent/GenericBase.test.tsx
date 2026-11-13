import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useLoadingFeature, useSelectedFeature } from '../../MyArea.hooks.ts';
import { GenericContent } from './GenericBase.tsx';
import { MyAreaDetailPanel } from './MyAreaDetailPanel.tsx';

describe('GenericContent', () => {
  it('renders valid JSON unchanged, including shared non-cyclic references', () => {
    const location = { name: 'Locatie', coordinates: [4.9, 52.3] };
    const panelItem = {
      locations: [location, location],
      active: true,
      count: 0,
      description: null,
      nested: { values: [false, '', -1] },
    };

    render(<GenericContent datasetId="test-dataset" panelItem={panelItem} />);

    expect(screen.getByText(/"name": "Locatie"/).textContent).toBe(
      JSON.stringify(panelItem, null, '  ')
    );
    expect(
      screen.queryByText('Gegevens kunnen niet worden getoond.')
    ).not.toBeInTheDocument();
  });

});

describe('MyAreaDetailPanel', () => {
  it('renders a loaded JSON feature through the generic fallback', () => {
    const feature = {
      id: 'mock-feature',
      datasetId: 'test-dataset',
      name: 'Locatie',
    };
    useLoadingFeature.setState({ loadingFeature: feature });
    useSelectedFeature.setState({ selectedFeature: feature });

    render(<MyAreaDetailPanel />);

    expect(screen.getByText(/"name": "Locatie"/).textContent).toBe(
      JSON.stringify(feature, null, '  ')
    );
  });

  it('shows the existing location error when feature loading fails', () => {
    useLoadingFeature.setState({ loadingFeature: { isError: true } });

    render(<MyAreaDetailPanel />);

    expect(
      screen.getByText(
        'Er kan op dit moment geen informatie getoond worden over deze locatie.'
      )
    ).toBeInTheDocument();
  });
});
