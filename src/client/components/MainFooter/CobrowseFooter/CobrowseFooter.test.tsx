import { render, waitFor } from '@testing-library/react';
import { describe, expect } from 'vitest';

import { CobrowseFooter, LABEL_HULP_SCHERMDELEN } from './CobrowseFooter';

describe('<CobrowseFooter />', () => {
  test('CobrowseFooter is not shown when toggle is disabled', async () => {
    vi.mock('../../../../universal/config/feature-toggles.ts', () => ({
      FeatureToggle: {
        cobrowseIsActive: false,
      },
    }));

    const screen = render(<CobrowseFooter />);
    await waitFor(() => {
      const schermdelenButton = screen.queryByText(LABEL_HULP_SCHERMDELEN);
      expect(schermdelenButton).not.toBeInTheDocument();
    });
  });

  test('CobrowseFooter is shown when toggle is enabled', async () => {
    vi.mock('../../../../universal/config/feature-toggles.ts', () => ({
      FeatureToggle: {
        cobrowseIsActive: true,
      },
    }));

    const screen = render(<CobrowseFooter />);
    await waitFor(() => {
      const schermdelenButton = screen.queryByText(LABEL_HULP_SCHERMDELEN);
      expect(schermdelenButton).toBeInTheDocument();
    });
  });
});
