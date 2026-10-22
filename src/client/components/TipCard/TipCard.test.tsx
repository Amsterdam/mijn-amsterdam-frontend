import type { ComponentProps } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import styles from './TipCard.module.scss';
import { TipCard, tipCardColors } from './TipCard.tsx';
type TipCardProps = ComponentProps<typeof TipCard>;

describe('<TipCard />', () => {
  const defaultProps: TipCardProps = {
    backgroundColor: tipCardColors[0],
    heading: 'Tip 1',
    description: 'Beschrijving tip 1',
    tipReason: 'Omdat dit voor u relevant kan zijn.',
    onRead: vi.fn(),
    link: {
      to: '/tip-1',
      title: 'Bekijk tip 1',
    },
  };

  const renderTipCard = (props: Partial<TipCardProps> = {}) => {
    return render(
      <BrowserRouter>
        <TipCard {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  it('renders the heading', () => {
    renderTipCard();

    expect(screen.getByRole('heading', { name: 'Tip 1' })).toBeInTheDocument();
  });

  it('renders the tip link', () => {
    renderTipCard();

    expect(screen.getByRole('link', { name: 'Toon tip' })).toBeInTheDocument();
  });

  it('renders the onRead button', () => {
    renderTipCard();

    expect(
      screen.getByRole('button', { name: 'Markeer tip als gelezen' })
    ).toBeInTheDocument();
  });

  it('calls onRead when the onRead button is clicked', () => {
    const onReadMock = vi.fn();
    renderTipCard({ onRead: onReadMock });

    const removeButton = screen.getByRole('button', {
      name: 'Markeer tip als gelezen',
    });
    fireEvent.click(removeButton);

    expect(onReadMock).toHaveBeenCalledTimes(1);
  });

  describe('background color', () => {
    it.each(tipCardColors)(
      'applies the correct background class for %s',
      (color) => {
        renderTipCard({ backgroundColor: color });

        const card = screen.getByRole('article');

        expect(card).toHaveClass(styles.TipCard);
        expect(card).toHaveClass(styles[`TipCard__${color}Background`]);
      }
    );
  });
});
