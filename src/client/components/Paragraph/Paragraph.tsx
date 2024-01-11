import {
  Paragraph as Paragraph_,
  ParagraphProps,
} from '@amsterdam/design-system-react';
import styles from './Paragraph.module.scss';
import classNames from 'classnames';

type MAParagraphProps = ParagraphProps & {
  mb?: '0' | '2' | '3' | '4';
  textAlign?: 'left' | 'right' | 'center';
};

const bottomMargins = {
  'mb-0': styles.Paragraph__bottom_margin_0,
  'mb-2': styles.Paragraph__bottom_margin_2,
  'mb-3': styles.Paragraph__bottom_margin_3,
  'mb-4': styles.Paragraph__bottom_margin_4,
};

export function MaParagraph({
  children,
  mb = '2',
  textAlign = 'left',
  ...props
}: MAParagraphProps) {
  return (
    <Paragraph_
      className={classNames(
        bottomMargins[`mb-${mb}`],
        styles[`Paragraph__text_align_${textAlign}`]
      )}
      {...props}
    >
      {children}
    </Paragraph_>
  );
}
