import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Dialog } from './Modal';

describe('Modal test', () => {
  window.scrollTo = jest.fn();

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

  it('Opens and Closes the modal via close callback', () => {
    const close = jest.fn(() => {
      rerender(
        <Dialog isOpen={false} onClose={close}>
          Testje
        </Dialog>
      );
    });

    const { rerender } = render(
      <Dialog isOpen={false} onClose={close}>
        Testje
      </Dialog>
    );

    expect(screen.queryByText('Testje')).toBeNull();

    rerender(
      <Dialog isOpen={true} onClose={close}>
        Testje
      </Dialog>
    );
    expect(screen.getByText('Testje')).toBeInTheDocument();
    userEvent.click(screen.getByTitle('Overlay sluiten'));
    expect(close).toHaveBeenCalled();
    expect(screen.queryByText('Testje')).toBeNull();
  });
});
