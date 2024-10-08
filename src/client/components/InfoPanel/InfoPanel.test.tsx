import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import InfoPanel from './InfoPanel';

const infoData = {
  foo: 'bar',
  hello: '',
};

const title = 'The InfoPanel';

const actionLinks = [
  {
    title: 'An external actionLink!',
    url: 'http://example.org',
    external: true,
  },
  {
    title: 'An internal actionLink!',
    url: 'http://example.org',
  },
];

describe('InfoPanel', () => {
  it('Renders everything correctly', () => {
    render(
      <BrowserRouter>
        <InfoPanel
          title={title}
          actionLinks={actionLinks}
          panelData={infoData}
        />
      </BrowserRouter>
    );
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(actionLinks[0].title)).toBeInTheDocument();
    expect(screen.getByText(actionLinks[1].title)).toBeInTheDocument();
    expect(screen.getByText(/foo/)).toBeInTheDocument();
    expect(screen.getByText(/bar/)).toBeInTheDocument();
    expect(screen.queryByText(/hello/)).toBe(null);
  });

  it('Doesn`t omit falsey values', () => {
    render(
      <BrowserRouter>
        <InfoPanel
          title={title}
          actionLinks={actionLinks}
          panelData={infoData}
          omitPairWithFalseyValues={false}
        />
      </BrowserRouter>
    );
    expect(screen.getByText(/hello/)).toBeInTheDocument();
  });
});
