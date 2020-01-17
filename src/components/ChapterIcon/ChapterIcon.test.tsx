import React from 'react';
import { shallow } from 'enzyme';
import ChapterIcon from './ChapterIcon';
import { Chapters } from 'config/App.constants';

it('Renders without crashing', () => {
  shallow(<ChapterIcon chapter={Chapters.ROOT} />);
});
