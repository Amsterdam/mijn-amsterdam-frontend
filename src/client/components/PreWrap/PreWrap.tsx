import styles from './PreWrap.module.css';

export function PreWrap({ children }: { children: React.ReactNode }) {
  return <span className={styles.PreWrap}>{children}</span>;
}
