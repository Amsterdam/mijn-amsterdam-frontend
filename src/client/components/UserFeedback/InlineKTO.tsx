import { useLocation } from 'react-router';

import { UserFeedback } from './UserFeedback';
import styles from './UserFeedback.module.scss';
import type { RecordStr2 } from '../../../server/routing/route-helpers';
import { BFFApiUrls } from '../../config/api';
import { sendFormPostRequest, useBffApi } from '../../hooks/api/useBffApi';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useActiveThemaMenuItems } from '../../hooks/useThemaMenuItems';
import { useErrorMessages } from '../ErrorMessages/ErrorMessages';
import { PageContentCell } from '../Page/Page';

export function useSubmitUserFeedback() {
  return useBffApi<{ success: boolean }>('user-feedback', {
    fetchImmediately: false,
    url: BFFApiUrls.USER_FEEDBACK_SUBMIT,
    sendRequest: sendFormPostRequest,
  });
}

type InlineKTOProps = {
  userFeedbackDetails?: object;
};

export function InlineKTO({ userFeedbackDetails }: InlineKTOProps) {
  const { errors } = useErrorMessages();
  const { items: myThemaItems, isLoading: isMyThemasLoading } =
    useActiveThemaMenuItems();
  const location = useLocation();
  const profileType = useProfileTypeValue();
  const {
    isError,
    isLoading,
    fetch: submitUserFeedback,
  } = useSubmitUserFeedback();

  const browserInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    windowInnerSize: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  function saveFormData(formData: FormData) {
    const userFeedbackData: RecordStr2 = {};

    // User data from the form
    formData.forEach((value, key) => {
      userFeedbackData[key] = value.toString();
    });

    // Browser and page data
    userFeedbackData['browser.pathname'] = location.pathname;
    userFeedbackData['browser.title'] = document.title;

    Object.entries(browserInfo).forEach(([key, value]) => {
      userFeedbackData[`browser.${key}`] = value.toString();
    });

    // Additional user feedback details
    if (userFeedbackDetails) {
      Object.entries(userFeedbackDetails).forEach(([key, value]) => {
        userFeedbackData[key] =
          typeof value === 'object' ? JSON.stringify(value) : String(value);
      });
    }

    // User profile and thema data
    if (!isMyThemasLoading) {
      userFeedbackData['ma.themas'] = JSON.stringify(
        myThemaItems.filter((item) => item.isActive).map((item) => item.title)
      );
      if (errors.length) {
        userFeedbackData['ma.errors'] = JSON.stringify(errors);
      }
      userFeedbackData['ma.profileType'] = profileType || 'unknown';
    }

    console.log('Feedback submitted:', userFeedbackData);
    submitUserFeedback({ payload: userFeedbackData });
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
