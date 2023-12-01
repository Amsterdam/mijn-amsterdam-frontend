import {
  Paragraph as Paragraph_,
  ParagraphProps,
} from '@amsterdam/design-system-react';
import styles from './Paragraph.module.scss';

type MAParagraphProps = ParagraphProps & {
  mb?: '0' | '2' | '3' | '4';
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
  ...props
}: MAParagraphProps) {
  return (
    <Paragraph_ className={bottomMargins[`mb-${mb}`]} {...props}>
      {children}
    </Paragraph_>
  );
}
