import {
  Paragraph as Paragraph_,
  ParagraphProps,
} from '@amsterdam/design-system-react';
import classNames from 'classnames';
import styles from './Paragraph.module.scss';

type MAParagraphProps = ParagraphProps & {
  mb?: '0' | '2' | '3' | '4';
  textAlign?: 'left' | 'right' | 'center';
};

const bottomMargins = {
  'mb-0': styles['Paragraph__bottom-margin-0'],
  'mb-2': styles['Paragraph__bottom-margin-2'],
  'mb-3': styles['Paragraph__bottom-margin-3'],
  'mb-4': styles['Paragraph__bottom-margin-4'],
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
        styles[`Paragraph__text-align-${textAlign}`]
      )}
      {...props}
    >
      {children}
    </Paragraph_>
  );
}
