import React from 'react';
import { shallow } from 'enzyme';
import ChapterHeadingIcon from './ChapterHeadingIcon';
import { Chapters } from 'App.constants';

it('Renders without crashing', () => {
  shallow(<ChapterHeadingIcon chapter={Chapters.ROOT} />);
});
