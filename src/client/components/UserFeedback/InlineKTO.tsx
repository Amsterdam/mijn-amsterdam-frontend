import { useLocation } from 'react-router';

import { UserFeedback } from './UserFeedback';
import styles from './UserFeedback.module.scss';
import type { RecordStr2 } from '../../../server/routing/route-helpers';
import { PageContentCell } from '../Page/Page';

type InlineKTOProps = {
  userFeedbackDetails?: RecordStr2;
};

export function InlineKTO({ userFeedbackDetails }: InlineKTOProps) {
  const location = useLocation();
  function saveFormData(formData: FormData) {
    // const feedback = formData.get('feedback');
    // const email = formData.get('email');
    formData.append('path', location.pathname);
    formData.append('title', document.title);
    if (userFeedbackDetails) {
      Object.entries(userFeedbackDetails).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    console.log('Feedback submitted:', formData);
    // Here you would typically send the data to your server
  }
  return (
    <PageContentCell>
      <div className={styles.centered}>
        <UserFeedback className="ams-mb-xl" onSubmit={saveFormData} />
      </div>
    </PageContentCell>
  );
}
