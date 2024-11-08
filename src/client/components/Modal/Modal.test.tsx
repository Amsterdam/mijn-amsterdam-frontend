import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { Modal } from './Modal';

describe('Modal test', () => {
  it('Renders without crashing', () => {
    render(
      <Modal isOpen={false} onClose={() => void 0}>
        Testje
      </Modal>
    );
  });

  it('Places the Modal content top/10px left/10px width/100px', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => void 0}>
        Testje
      </Modal>
    );

    expect(screen.getByText('Testje')).toBeInTheDocument();

    rerender(
      <Modal isOpen={false} onClose={() => void 0}>
        Testje
      </Modal>
    );

    expect(screen.queryByText('Testje')).toBeNull();
  });

  it('Opens and Closes the modal via close callback', async () => {
    const title = 'Modal';

    const close = vi.fn(() => {
      rerender(
        <Modal
          isOpen={false}
          onClose={close}
          closeButtonLabel="Overlay sluiten"
        >
          Testje
        </Modal>
      );
    });

    const { rerender } = render(
      <Modal
        isOpen={false}
        onClose={close}
        title={title}
        closeButtonLabel="Overlay sluiten"
      >
        Testje
      </Modal>
    );

    expect(screen.queryByText('Testje')).toBeNull();

    rerender(
      <Modal
        isOpen={true}
        onClose={close}
        title={title}
        closeButtonLabel="Overlay sluiten"
      >
        Testje
      </Modal>
    );
    expect(screen.getByText('Testje')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Overlay sluiten'));

    expect(close).toHaveBeenCalled();
    expect(screen.queryByText('Testje')).toBeNull();
  });
});
