import { BrowserRouter } from 'react-router-dom';
import ChapterIcon from './ChapterIcon';
import { Chapters } from '../../../universal/config';

import { render, screen } from '@testing-library/react';
import { ChapterTitles } from '../../../universal/config/chapter';

describe('<ChapterIcon/>', () => {
  it('Renders icon with label', () => {
    render(
      <BrowserRouter>
        <ChapterIcon chapter={Chapters.INKOMEN} />
      </BrowserRouter>
    );

    expect(
      screen.getByLabelText(ChapterTitles[Chapters.INKOMEN])
    ).toBeInTheDocument();
  });
});
