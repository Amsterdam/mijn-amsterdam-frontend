import React from 'react';
import { shallow } from 'enzyme';
import ChapterIcon from './ChapterIcon';
import { Chapters } from 'config/App.constants';
import { BrowserRouter } from 'react-router-dom';

it('Renders without crashing', () => {
  shallow(
    <BrowserRouter>
      <ChapterIcon chapter={Chapters.ROOT} />
    </BrowserRouter>
  );
});
