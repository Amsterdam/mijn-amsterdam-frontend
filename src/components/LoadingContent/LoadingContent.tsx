import React from 'react';
import styles from './LoadingContent.module.scss';
import { ComponentChildren } from 'App.types';
import classnames from 'classnames';

type width = string;
type height = string;
type marginBottom = string;
type BarProp = width | height | marginBottom;

export type BarConfig = Array<BarProp[]>;

export interface ComponentProps {
  children?: ComponentChildren;
  barConfig?: BarConfig;
  className?: any;
}

const defaultBarConfig: BarConfig = [
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
