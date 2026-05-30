'use client';

import Button from '../UI/Button';
import { useTranslations } from 'next-intl';
import QuestionAiIcon from '../Icons/QuestionAiIcon';
import { useRouter } from '@/src/i18n/navigation';

const AiQuizzGenerator = () => {
  const t = useTranslations('ai-quiz-generator');
  const route = useRouter();

  const handleNavigateToQuiz = () => {
    route.push('/quiz');
  };

  return (
    <Button
      onClick={handleNavigateToQuiz}
      className="flex items-center justify-between px-5 w-full"
    >
      {t('generate-quiz')}
      <span className="text-2xl font-extrabold">
        <QuestionAiIcon className="w-6 h-6" />
      </span>
    </Button>
  );
};

export default AiQuizzGenerator;
