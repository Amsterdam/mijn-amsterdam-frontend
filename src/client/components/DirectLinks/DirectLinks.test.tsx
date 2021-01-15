import { render } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import { usePhoneScreen } from '../../hooks/media.hook';
import DirectLinks from './DirectLinks';

jest.mock('../../hooks/media.hook');

describe('<DirectLinks />', () => {
  function getMountHtml(profileType: ProfileType) {
    return render(
      <BrowserRouter>
        <DirectLinks profileType={profileType} />
      </BrowserRouter>
    ).asFragment();
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
    (usePhoneScreen as jest.Mock).mockReturnValueOnce(true);
    expect(getMountHtml('private')).toMatchSnapshot();
  });
});
