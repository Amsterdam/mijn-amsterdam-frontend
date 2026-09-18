import type { ComponentProps } from 'react';

import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';

import { TipCard, tipCardColors } from '../../components/TipCard/TipCard.tsx';

type TipCardProps = ComponentProps<typeof TipCard>;

const tipCardProps: TipCardProps = {
  backgroundColor: tipCardColors[0],
  heading: 'Tip 1',
  description: 'Beschrijving tip 1',
  tipReason: 'Omdat dit voor u relevant kan zijn.',
  link: {
    to: '/tip-1',
    title: 'Bekijk tip 1',
  },
};

function renderTipCard(props: Partial<TipCardProps> = {}) {
  return render(<TipCard {...tipCardProps} {...props} />, {
    wrapper: BrowserRouter,
  });
}

describe('<TipCard />', () => {
  test('Renders correctly', () => {
    const screen = renderTipCard();

    expect(screen.asFragment()).toMatchSnapshot();
  });

  it('Displays the heading', () => {
    const screen = renderTipCard();

    expect(
      screen.getByRole('heading', { name: tipCardProps.heading })
    ).toBeInTheDocument();
  });

  it('Displays the tip link', () => {
    const screen = renderTipCard();

    expect(screen.getByRole('link', { name: 'Toon tip' })).toBeInTheDocument();
  });

  it('Displays the remove button', () => {
    const screen = renderTipCard();

    expect(
      screen.getByRole('button', { name: 'Verwijder tip' })
    ).toBeInTheDocument();
  });

  test.each(tipCardColors)('Renders color variant %s', (backgroundColor) => {
    const screen = renderTipCard({ backgroundColor });

    expect(screen.asFragment()).toMatchSnapshot();
  });
});
