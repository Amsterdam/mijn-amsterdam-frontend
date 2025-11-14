import { ReactNode } from 'react';

import classnames from 'classnames';

import styles from './LoadingContent.module.scss';

type width = string;
type height = string;
type marginBottom = string;

export type BarConfig = Array<[width, height, marginBottom]>;

export interface LoadingContentProps {
  children?: ReactNode;
  barConfig?: BarConfig;
  className?: string;
  inline?: boolean;
}

const defaultBarConfig: BarConfig = [
  ['70%', '2rem', '.7rem'],
  ['90%', '2rem', '.7rem'],
  ['90%', '2rem', '.7rem'],
  ['40%', '2rem', '0'],
];

export default function LoadingContent({
  barConfig = defaultBarConfig,
  inline = false,
  className,
}: LoadingContentProps) {
  return (
    <span
      className={classnames(
        styles.LoadingContent,
        inline ? styles['LoadingContent--inline'] : '',
        className
      )}
    >
      <span className="ams-visually-hidden">Inhoud wordt opgehaald...</span>
      {barConfig.map(([width, height, marginBottom], index) => {
        return (
          <span
            key={index}
            style={{
              width,
              height,
              marginBottom,
            }}
          />
        );
      })}
    </span>
  );
}
