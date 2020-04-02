import { BrowserRouter } from 'react-router-dom';
import ChapterIcon from './ChapterIcon';
import { Chapters } from '../../config/Chapter.constants';
import React from 'react';
import { shallow } from 'enzyme';

it('Renders without crashing', () => {
  shallow(
    <BrowserRouter>
      <ChapterIcon chapter={Chapters.ROOT} />
    </BrowserRouter>
  );
});
