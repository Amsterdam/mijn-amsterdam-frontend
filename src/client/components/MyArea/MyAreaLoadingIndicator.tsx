import {
  BuildingsIcon,
  HousingIcon,
} from '@amsterdam/design-system-react-icons';

import styles from './MyAreaLoadingIndicator.module.scss';
import { useProfileTypeValue } from '../../hooks/useProfileType.ts';

interface MyAreaLoadingIndicatorProps {
  label: string;
}

export default function MyAreaLoadingIndicator({
  label,
}: MyAreaLoadingIndicatorProps) {
  const profileType = useProfileTypeValue();
  return (
    <div className={styles.MyAreaLoader}>
      <span>
        {profileType === 'private' ? (
          <HousingIcon aria-hidden="true" />
        ) : (
          <BuildingsIcon aria-hidden="true" />
        )}
        {label}
      </span>
    </div>
  );
}
