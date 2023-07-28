import MyTips from './MyTips';

import { render, screen } from '@testing-library/react';
import { MyTip } from '../../../universal/types';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { RecoilRoot } from 'recoil';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../hooks/useProfileType');

const TIPS: MyTip[] = [
  {
    profileTypes: ['private'],
    datePublished: '2020-06-15',
    description:
      'Maakt u mondkapjes? Of zoekt u manieren om te blijven bewegen? Amsterdammers helpen elkaar tijdens de coronacrisis.',
    id: 'mijn-12',
    imgUrl:
      'https://mijn.acc.amsterdam.nl/api/tips/static/tip_images/mondkapjes.jpg',
    isPersonalized: false,
    link: {
      title: 'Vind elkaar',
      to: 'https://wijamsterdam.nl/',
    },
    priority: 70,
    reason: ['Omdat dit een toptip is.'],
    title: 'Amsterdammers helpen Amsterdammers',
  },
];

describe('<MyTips />', () => {
  (useProfileTypeValue as jest.Mock).mockResolvedValueOnce('prive');

  it('Renders without crashing', () => {
    (window as any).scrollTo = jest.fn();
    render(
      <MemoryRouter>
        <RecoilRoot>
          <MyTips isLoading={false} items={TIPS} />
        </RecoilRoot>
      </MemoryRouter>
    );
    expect(screen.getByText('Vind elkaar')).toBeInTheDocument();
    userEvent.click(screen.getByLabelText('Reden waarom u deze tip ziet'));
    expect(screen.getByText('Omdat dit een toptip is.')).toBeInTheDocument();
  });
});
