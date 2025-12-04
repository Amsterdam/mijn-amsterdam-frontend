import classnames from 'classnames';

import styles from './OtapLabel.module.scss';
import { ProfileName } from './ProfileName';
import { OTAP_ENV } from '../../../universal/config/env';

const shortEnv: Record<typeof OTAP_ENV, string> = {
  development: 'dev',
  acceptance: 'acc',
  test: 'test',
  production: '',
} as const;

export function EnvLabel({ showProfileName }: { showProfileName: boolean }) {
  return ['test', 'development', 'acceptance'].includes(OTAP_ENV) ? (
    <small
      className={classnames(
        styles['otap-env'],
        styles[`otap-env--${OTAP_ENV}`]
      )}
    >
      {shortEnv[OTAP_ENV]}
      {showProfileName && (
        <>
          {' @ '}
          <ProfileName fallbackName="[Error: Problem getting <ProfileName/>]" />
        </>
      )}
    </small>
  ) : null;
}
