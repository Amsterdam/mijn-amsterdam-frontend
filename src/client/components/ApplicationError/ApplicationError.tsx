import styles from './ApplicationError.module.scss';
import { FallbackProps } from 'react-error-boundary';

export default function ApplicationError({ error }: FallbackProps) {
  return (
    <div className={styles.ApplicationError}>
      <h1>Kritieke applicatie fout</h1>
      <p>
        <strong>Error:</strong> {error && error.toString()}
      </p>
    </div>
  );
}
