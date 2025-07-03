import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { Modal } from './Modal';

const mocks = vi.hoisted(() => {
  return {
    onClose: vi.fn(),
  };
});

describe('Modal test', () => {
  beforeAll(() => {
    // Mock the close method of the dialog element, JSDOM does not support it
    HTMLDialogElement.prototype.close = vi.fn(function mock(
      this: HTMLDialogElement
    ) {
      this.open = false;
      mocks.onClose();
    });
  });

  it('Renders without crashing', () => {
    render(
      <Modal isOpen={false} onClose={() => void 0}>
        Testje
      </Modal>
    );
  });

  it('Places the Modal content top/10px left/10px width/100px', () => {
    const { rerender } = render(
      <Modal isOpen onClose={() => void 0}>
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

    //
    mocks.onClose = close;

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
        isOpen
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
