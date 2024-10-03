import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import ThemaIcon from './ThemaIcon';
import { Themas } from '../../../universal/config/thema';
import { ThemaTitles } from '../../config/thema';

describe('<ThemaIcon/>', () => {
  it('Renders icon with label', () => {
    render(
      <BrowserRouter>
        <ThemaIcon thema={Themas.INKOMEN} />
      </BrowserRouter>
    );

    expect(
      screen.getByLabelText(ThemaTitles[Themas.INKOMEN])
    ).toBeInTheDocument();
  });
});
