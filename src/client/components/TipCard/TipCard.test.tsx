import type { ComponentProps } from 'react';

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { TipCard, tipCardColors } from './TipCard.tsx';

type TipCardProps = ComponentProps<typeof TipCard>;

describe('<TipCard />', () => {
  const defaultProps: TipCardProps = {
    backgroundColor: tipCardColors[0],
    heading: 'Tip 1',
    description: 'Beschrijving tip 1',
    tipReason: 'Omdat dit voor u relevant kan zijn.',
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

  it('renders the remove button', () => {
    renderTipCard();

    expect(
      screen.getByRole('button', { name: 'Markeer tip als gelezen' })
    ).toBeInTheDocument();
  });

  it.each(tipCardColors)(
    'renders with background color %s',
    (backgroundColor) => {
      renderTipCard({ backgroundColor });

      expect(
        screen.getByRole('heading', { name: 'Tip 1' })
      ).toBeInTheDocument();
    }
  );
});
