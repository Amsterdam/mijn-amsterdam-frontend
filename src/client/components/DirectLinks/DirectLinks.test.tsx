import React from 'react';
import { shallow, mount } from 'enzyme';
import DirectLinks from './DirectLinks';
import * as mediaHook from '../../hooks/media.hook';
import { BrowserRouter } from 'react-router-dom';

describe('<DirectLinks />', () => {
  let hookSpies: any = {};
  beforeAll(() => {
    (window.matchMedia as any) = jest.fn(() => {
      return {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    });
  });

  it('It renders private links', () => {
    expect(
      shallow(<DirectLinks profileType="private" />).html()
    ).toMatchSnapshot();
  });
  it('It renders private-commercial links', () => {
    expect(
      shallow(<DirectLinks profileType="private-commercial" />).html()
    ).toMatchSnapshot();
  });
  it('It renders commercial links', () => {
    expect(
      shallow(<DirectLinks profileType="commercial" />).html()
    ).toMatchSnapshot();
  });
  it('It renders additional links on phone', () => {
    hookSpies.usePhoneScreen = jest
      .spyOn(mediaHook, 'usePhoneScreen')
      .mockImplementationOnce(() => true);
    expect(
      mount(
        <BrowserRouter>
          <DirectLinks profileType="private" />
        </BrowserRouter>
      ).html()
    ).toMatchSnapshot();
    hookSpies.usePhoneScreen.mockRestore();
  });
});
