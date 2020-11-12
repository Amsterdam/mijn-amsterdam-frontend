import React from 'react';
import { mount } from 'enzyme';
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

  function getMountHtml(profileType: ProfileType) {
    return mount(
      <BrowserRouter>
        <DirectLinks profileType={profileType} />
      </BrowserRouter>
    ).html();
  }

  it('It renders private links', () => {
    expect(getMountHtml('private')).toMatchSnapshot();
  });
  it('It renders private-commercial links', () => {
    expect(getMountHtml('private-commercial')).toMatchSnapshot();
  });
  it('It renders commercial links', () => {
    expect(getMountHtml('commercial')).toMatchSnapshot();
  });
  it('It renders additional links on phone', () => {
    hookSpies.usePhoneScreen = jest
      .spyOn(mediaHook, 'usePhoneScreen')
      .mockImplementationOnce(() => true);
    expect(getMountHtml('private')).toMatchSnapshot();
    hookSpies.usePhoneScreen.mockRestore();
  });
});
