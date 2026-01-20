import { useLocation } from 'react-router';

import { UserFeedback } from './UserFeedback';
import styles from './UserFeedback.module.scss';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useActiveThemaMenuItems } from '../../hooks/useThemaMenuItems';
import { useErrorMessages } from '../ErrorMessages/ErrorMessages';
import { PageContentCell } from '../Page/Page';

type InlineKTOProps = {
  userFeedbackDetails?: object;
};

export function InlineKTO({ userFeedbackDetails }: InlineKTOProps) {
  const { errors } = useErrorMessages();
  const { items: myThemaItems, isLoading: isMyThemasLoading } =
    useActiveThemaMenuItems();
  const location = useLocation();
  const profileType = useProfileTypeValue();

  const browserInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    windowInnerSize: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  function saveFormData(formData: FormData) {
    // const feedback = formData.get('feedback');
    // const email = formData.get('email');
    formData.append('browser.pathname', location.pathname);
    formData.append('browser.title', document.title);

    Object.entries(browserInfo).forEach(([key, value]) => {
      formData.append(`browser.${key}`, value.toString());
    });

    if (userFeedbackDetails) {
      Object.entries(userFeedbackDetails).forEach(([key, value]) => {
        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        );
      });
    }

    if (!isMyThemasLoading) {
      formData.append(
        'ma.themas',
        JSON.stringify(
          myThemaItems.filter((item) => item.isActive).map((item) => item.title)
        )
      );
      if (errors.length) {
        formData.append('ma.errors', JSON.stringify(errors));
      }
      formData.append('ma.profileType', profileType || 'unknown');
    }

    console.log('Feedback submitted:', Object.fromEntries(formData.entries()));
    // Here you would typically send the data to your server
  }

  function savePageRating(rating: number) {
    console.log('Page rated with:', rating);
    // Here you would typically send the rating to your server
  }

  return (
    <PageContentCell>
      <div className={styles.centered}>
        <UserFeedback
          className="ams-mb-xl"
          onSubmit={saveFormData}
          onRate={savePageRating}
        />
      </div>
    </PageContentCell>
  );
}
