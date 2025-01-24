import { render } from '@testing-library/react';

import BezwarenStatusLines from './BezwarenStatusLines';

const statussen = [
  {
    uuid: 'b62fdaa9-f7ec-45d1-b23c-7f36fa00b393',
    datum: '2023-03-29T10:00:00+02:00',
    statustoelichting: 'Ontvangen',
  },
  {
    uuid: '00000000-0000-0000-0000-000000000000',
    datum: '',
    statustoelichting: 'In behandeling',
  },
  {
    uuid: '00000000-0000-0000-0000-000000000000',
    datum: '',
    statustoelichting: 'Afgehandeld',
  },
];

describe('BezwarenStatusLines', () => {
  it('should render the right snapshot when status is received', () => {
    expect(
      render(<BezwarenStatusLines id="1" statussen={statussen} />).asFragment()
    ).toMatchSnapshot();
  });

  it('should render the right snapshot when status is in progress', () => {
    const modStatus = [...statussen];

    modStatus[1].uuid = 'b62fdaa9-1111-45d1-b23c-7f36fa00b393';
    modStatus[1].datum = '2023-04-02T10:00:00+02:00';

    expect(
      render(<BezwarenStatusLines id="1" statussen={modStatus} />).asFragment()
    ).toMatchSnapshot();
  });

  it('should render the right snapshot when status is done', () => {
    const modStatus = [...statussen];

    modStatus[1].uuid = 'b62fdaa9-1111-45d1-b23c-7f36fa00b393';
    modStatus[1].datum = '2023-04-02T10:00:00+02:00';
    modStatus[2].uuid = 'b62fdaa9-2222-45d1-b23c-7f36fa00b393';
    modStatus[2].datum = '2023-04-05T10:00:00+02:00';

    expect(
      render(<BezwarenStatusLines id="1" statussen={modStatus} />).asFragment()
    ).toMatchSnapshot();
  });
});
