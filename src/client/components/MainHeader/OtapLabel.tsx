import classnames from 'classnames';

import styles from './OtapLabel.module.scss';
import { OTAP_ENV } from '../../../universal/config/env';

export function OtapLabel() {
  return ['test', 'development', 'acceptance'].includes(OTAP_ENV) ? (
    <small
      className={classnames(
        styles['otap-env'],
        styles[`otap-env--${OTAP_ENV}`]
      )}
    >
      {OTAP_ENV}
    </small>
  ) : null;
}
