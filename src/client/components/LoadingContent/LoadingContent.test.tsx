import { render } from '@testing-library/react';
import React from 'react';
import LoadingContent from './LoadingContent';

describe('LoadingContent component', () => {
  it('Renders without crashing', () => {
    render(<LoadingContent />);
  });
});
