import React from 'react';
import styles from './MainHeaderHero.module.scss';
import DEFAULT_IMG_SRC from 'assets/images/main-header-hero-default.png';

const DEFAULT_ALT = 'Sfeerbeeld kenmerkend voor de Amsterdammer';

export default function MainHeaderHero(props) {
  const src = props.src || DEFAULT_IMG_SRC;
  const alt = props.alt || DEFAULT_ALT;
  return (
    <div className={styles.MainHeaderHero}>
      <img src={src} alt={alt} />
    </div>
  );
}
