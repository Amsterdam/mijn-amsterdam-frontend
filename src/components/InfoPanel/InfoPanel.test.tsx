import React from 'react';
import { shallow } from 'enzyme';
import InfoPanel from './InfoPanel';
import { BrowserRouter } from 'react-router-dom';

const infoData = {
  foo: 'bar',
  bar: '',
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
    expect(
      shallow(
        <BrowserRouter>
          <InfoPanel
            title={title}
            actionLinks={actionLinks}
            panelData={infoData}
          />
        </BrowserRouter>
      ).html()
    ).toMatchSnapshot();
  });

  it('Doesn`t omit falsey values', () => {
    expect(
      shallow(
        <InfoPanel panelData={infoData} omitPairWithFalseyValues={false} />
      ).html()
    ).toMatchSnapshot();
  });
});
