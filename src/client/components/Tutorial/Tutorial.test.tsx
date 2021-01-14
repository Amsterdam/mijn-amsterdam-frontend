import { render } from '@testing-library/react';
import React from 'react';
import Tutorial from './Tutorial';

jest.mock('../../hooks/media.hook');

describe('tutorial', () => {
  it('Renders without crashing', () => {
    render(
      <div>
        <div data-tutorial-item="Hello world!left-top">This is happening</div>
        <div data-tutorial-item="Goody two shoes!left-bottom">
          On a large scale
        </div>
        <Tutorial onClose={() => void 0} />
      </div>
    );
  });
});
