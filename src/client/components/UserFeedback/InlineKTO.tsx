import { useLocation } from 'react-router';

import { UserFeedback } from './UserFeedback';
import styles from './UserFeedback.module.scss';
import { useSubmitUserFeedback } from './useSubmitUserFeedback';
import type { RecordStr2 } from '../../../server/routing/route-helpers';
import { useAppStateGetter } from '../../hooks/useAppStateStore';
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
  const {
    isError,
    isLoading,
    fetch: submitUserFeedback,
  } = useSubmitUserFeedback();
  const appState = useAppStateGetter();

  const userFeedbackQuestions = appState.KTO?.content?.questions ?? [];

  if (!userFeedbackQuestions.length) {
    return 'whoat?';
  }

  const browserInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    windowInnerSize: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  function saveFormData(formData: FormData) {
    const userFeedbackData: RecordStr2 = {};

    userFeedbackData.answers = JSON.stringify(
      Array.from(formData.entries())
        .filter(([_key, value]) => !!value)
        .map(([key, value]) => {
          return { question: key, answer: value.toString() };
        })
    );

    // Browser and page data
    userFeedbackData.browser_path = location.pathname;
    userFeedbackData.browser_title = document.title;

    Object.entries(browserInfo).forEach(([key, value]) => {
      userFeedbackData[`browser_${key}`] = value.toString();
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
      userFeedbackData.ma_themas = JSON.stringify(
        myThemaItems.filter((item) => item.isActive).map((item) => item.title)
      );
      if (errors.length) {
        userFeedbackData.ma_errors = JSON.stringify(errors);
      }
      userFeedbackData.ma_profileType = profileType || 'unknown';
    }

    submitUserFeedback({ payload: userFeedbackData });
  }

  function savePageRating(rating: number) {
    // Implement if we want to save rating before the form is submitted.
  }

  return (
    <PageContentCell>
      <div className={styles.centered}>
        <UserFeedback
          className="ams-mb-xl"
          onSubmit={saveFormData}
          onRate={savePageRating}
          questions={userFeedbackQuestions}
        />
      </div>
    </PageContentCell>
  );
}
