import React from 'react';
import styles from './LoadingContent.module.scss';
import { ComponentChildren } from 'App.types';
import classnames from 'classnames';

export type BarConfig = Array<string[]>;

export interface ComponentProps {
  children?: ComponentChildren;
  barConfig?: BarConfig;
  className?: any;
  darkMode?: boolean;
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
  darkMode = false,
}: ComponentProps) {
  return (
    <div
      className={classnames(
        styles.LoadingContent,
        darkMode && styles.DarkMode,
        className
      )}
    >
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
