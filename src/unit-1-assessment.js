import { mountAssessment } from './assessment-runtime.js';
import { UNIT_1_TEST, UNIT_1_QUESTIONS } from './unit-1-test-data.js';
import { unit1AssessmentDiagram } from './unit-1-test-diagrams.js';
mountAssessment({
  test: UNIT_1_TEST,
  questions: UNIT_1_QUESTIONS,
  diagramMarkup: unit1AssessmentDiagram,
  loadSolutions: () => import('./unit-1-test-solutions.js'),
  solutionGroupSize: 10,
  welcome: {
    sourceRange: '55–70',
    description: 'اختبار الوحدة الأولى من 60 سؤالاً جديداً ومتوازناً بين القوى المتلاقية والقوى المتوازية، ويجمع المفاهيم والحساب والرسم والتحليل والتحقق.',
    topics: ['الدرس 1: القوى المتلاقية', 'الدرس 2: القوى المتوازية', 'الحسابات', 'قراءة الرسوم', 'تحليل الأخطاء'],
    resultTitle: 'نتيجة اختبار الوحدة الأولى',
  },
});
