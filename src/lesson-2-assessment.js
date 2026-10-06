import { mountAssessment } from './assessment-runtime.js';
import { LESSON_2_TEST, LESSON_2_QUESTIONS } from './lesson-2-test-data.js';
import { lesson2AssessmentDiagram } from './lesson-2-test-diagrams.js';

mountAssessment({
  test: LESSON_2_TEST,
  questions: LESSON_2_QUESTIONS,
  diagramMarkup: lesson2AssessmentDiagram,
  loadSolutions: () => import('./lesson-2-test-solutions.js'),
  solutionGroupSize: 5,
  welcome: {
    sourceRange: '63–70',
    description: 'اختبار جديد من 20 سؤالاً يقيس تعريف القوى المتوازية، حالتي الجهة، شدة المحصلة، موضع حاملها، التحقق بالعزوم، وتحليل الأخطاء.',
    topics: ['التعريف', 'الجهة الواحدة', 'الجهتان المتعاكستان', 'موضع المحصلة', 'التحقق بالعزوم'],
  },
});
