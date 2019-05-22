import React from 'react';
import styles from './LoadingContent.module.scss';
import { ComponentChildren } from 'App.types';
import classnames from 'classnames';

export type BarConfig = Array<string[]>;

export interface ComponentProps {
  children?: ComponentChildren;
  barConfig?: BarConfig;
  className?: any;
}

const defaultBarConfig = [
  ['70%', '2rem', '.7rem'],
  ['90%', '2rem', '.7rem'],
  ['90%', '2rem', '.7rem'],
  ['40%', '2rem', '0'],
];

export default function LoadingContent({
  children,
  barConfig = defaultBarConfig,
  className,
}: ComponentProps) {
  return (
    <div className={classnames(styles.LoadingContent, className)}>
      {barConfig.map(([width, height, marginBottom], index) => {
        return (
          <div
            key={index}
            style={{
              width,
              height,
              marginBottom,
            }}
          />
        );
      })}
    </div>
  );
}
