import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { usePhoneScreen } from '../../hooks/media.hook';
import DirectLinks from './DirectLinks';

vi.mock('../../hooks/media.hook');

describe('<DirectLinks />', () => {
  function getMountHtml(profileType: ProfileType) {
    return render(
      <BrowserRouter>
        <DirectLinks profileType={profileType} />
      </BrowserRouter>
    ).asFragment();
  }

  it('renders private links', () => {
    expect(getMountHtml('private')).toMatchSnapshot();
  });
  it('renders commercial links', () => {
    expect(getMountHtml('commercial')).toMatchSnapshot();
  });
  it('renders additional links on phone', () => {
    (usePhoneScreen as vi.Mock).mockReturnValueOnce(true);
    expect(getMountHtml('private')).toMatchSnapshot();
  });
});
