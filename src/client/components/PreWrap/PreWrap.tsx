import styles from './PreWrap.module.scss';

export function PreWrap({ children }: { children: React.ReactNode }) {
  return <span className={styles.PreWrap}>{children}</span>;
}
