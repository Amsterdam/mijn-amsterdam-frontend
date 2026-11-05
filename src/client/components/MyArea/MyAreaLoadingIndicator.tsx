import { BuildingsIcon, HouseIcon } from '@amsterdam/design-system-react-icons';

import { useProfileTypeValue } from '../../hooks/useProfileType.ts';
import styles from './MyAreaLoadingIndicator.module.scss';

interface MyAreaLoadingIndicatorProps {
  label: string;
}

export function MyAreaLoadingIndicator({ label }: MyAreaLoadingIndicatorProps) {
  const profileType = useProfileTypeValue();
  return (
    <div className={styles.MyAreaLoader}>
      <span>
        {profileType === 'private' ? (
          <HouseIcon aria-hidden="true" />
        ) : (
          <BuildingsIcon aria-hidden="true" />
        )}
        {label}
      </span>
    </div>
  );
}
