import { render } from '@testing-library/react';
import { expect } from 'vitest';

import { CobrowseFooter, LABEL_HULP_SCHERMDELEN } from './CobrowseFooter';

test('<CobrowseFooter />', async () => {
  const screen = render(<CobrowseFooter />);
  const schermdelenButton = await screen.findByText(LABEL_HULP_SCHERMDELEN);
  expect(schermdelenButton).toBeInTheDocument();
});
