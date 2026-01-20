import { IconButton, Paragraph } from '@amsterdam/design-system-react';
import { StarFillIcon, StarIcon } from '@amsterdam/design-system-react-icons';

import styles from './UserFeedback.module.scss';

type RateButtonProps = {
  value: number;
  isActive: boolean;
  onClick?: () => void;
  disabled?: boolean;
};
function RateButton({
  isActive = false,
  value,
  onClick,
  disabled,
}: RateButtonProps) {
  return (
    <IconButton
      svg={isActive ? StarFillIcon : StarIcon}
      onClick={onClick}
      label={`Waardeer Mijn Amsterdam met ${value} sterren`}
      disabled={disabled}
      size="heading-2"
    />
  );
}

type RatingProps = {
  max: number;
  current: number;
  onRate?: (rating: number) => void;
  label?: string;
  disabled?: boolean;
};

export function Rating({ max, current, onRate, label, disabled }: RatingProps) {
  return (
    <div className={styles.Rating}>
      {label && <Paragraph>{label}</Paragraph>}
      {Array.from({ length: max }).map((_, index) => {
        const value = index + 1;
        return (
          <RateButton
            key={index}
            value={value}
            isActive={value <= current}
            onClick={() => !disabled && onRate && onRate(value)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}
