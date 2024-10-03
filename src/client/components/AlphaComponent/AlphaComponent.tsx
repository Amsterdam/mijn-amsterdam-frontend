import styles from './AlphaComponent.module.scss';
import { ComponentChildren } from '../../../universal/types';


export interface ComponentProps {
  children?: ComponentChildren;
}

export default function AlphaComponent({ children }: ComponentProps) {
  return <div className={styles.AlphaComponent}>AlphaComponent{children}</div>;
}
