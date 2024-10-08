import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { Dialog } from './Modal';

describe('Modal test', () => {
  it('Renders without crashing', () => {
    render(
      <Dialog isOpen={false} onClose={() => void 0}>
        Testje
      </Dialog>
    );
  });

  it('Places the Modal content top/10px left/10px width/100px', () => {
    const { rerender } = render(
      <Dialog
        contentHorizontalPosition={10}
        contentVerticalPosition={10}
        contentWidth={100}
        isOpen={true}
        onClose={() => void 0}
      >
        Testje
      </Dialog>
    );

    expect(screen.getByText('Testje')).toBeInTheDocument();

    rerender(
      <Dialog
        contentHorizontalPosition={10}
        contentVerticalPosition={10}
        contentWidth={100}
        isOpen={false}
        onClose={() => void 0}
      >
        Testje
      </Dialog>
    );

    expect(screen.queryByText('Testje')).toBeNull();
  });

  it('Opens and Closes the modal via close callback', async () => {
    const title = 'Overlay sluiten';

    const close = vi.fn(() => {
      rerender(
        <Dialog
          isOpen={false}
          onClose={close}
          actions={<button onClick={close}>Overlay sluiten</button>}
        >
          Testje
        </Dialog>
      );
    });

    const actions = <button onClick={close}>Overlay sluiten</button>;

    const { rerender } = render(
      <Dialog isOpen={false} onClose={close} title={title} actions={actions}>
        Testje
      </Dialog>
    );

    expect(screen.queryByText('Testje')).toBeNull();

    rerender(
      <Dialog isOpen={true} onClose={close} title={title} actions={actions}>
        Testje
      </Dialog>
    );
    expect(screen.getByText('Testje')).toBeInTheDocument();

    await userEvent.click(
      screen.getByText('Overlay sluiten', {
        selector: 'button',
      })
    );

    expect(close).toHaveBeenCalled();
    expect(screen.queryByText('Testje')).toBeNull();
  });
});
