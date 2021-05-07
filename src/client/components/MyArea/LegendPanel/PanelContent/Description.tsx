import InfoDetail from '../../../InfoDetail/InfoDetail';
import InnerHtml from '../../../InnerHtml/InnerHtml';
import styles from './GenericBase.module.scss';

interface DescriptionProps {
  description: string;
  label?: string;
}

export default function Description({
  description,
  label = 'Beschrijving',
}: DescriptionProps) {
  return (
    <InfoDetail
      className={styles.InfoDetailDescription}
      label={label}
      valueWrapperElement="div"
      value={<InnerHtml>{description}</InnerHtml>}
    />
  );
}
