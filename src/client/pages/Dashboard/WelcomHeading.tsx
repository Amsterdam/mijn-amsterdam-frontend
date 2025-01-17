import { ProfileName } from '../../components/MainHeader/ProfileName';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';

const HELLO = 'Welkom,';

export function WelcomeHeading() {
  return (
    <PageHeadingV2 showBacklink={false}>
      {HELLO}
      <br /> <ProfileName />
    </PageHeadingV2>
  );
}
