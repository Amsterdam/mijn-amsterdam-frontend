import classnames from 'classnames';

import styles from './OtapLabel.module.scss';
import { OTAP_ENV } from '../../../universal/config/env';
import { ProfileName } from './ProfileName';

export function EnvLabel({ isAuthenticated }: { isAuthenticated: boolean }) {
  return ['test', 'development', 'acceptance'].includes(OTAP_ENV) ? (
    <small
      style={{ maxWidth: '300px', overflow: 'hidden' }}
      className={classnames(
        styles['otap-env'],
        styles[`otap-env--${OTAP_ENV}`]
      )}
    >
      {OTAP_ENV}
      {isAuthenticated && (
        <>
          {' @ '}
          <ProfileName fallbackName="[Error: Problem getting <ProfileName/>]" />
        </>
      )}
    </small>
  ) : null;
}
