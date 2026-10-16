import { mountAssessment } from './assessment-runtime.js';
import { UNIT2L3_TEST, UNIT2L3_QUESTIONS } from './unit2-lesson3-test-data.js';
import { unit2l3AssessmentDiagram } from './unit2-lesson3-test-diagrams.js';

mountAssessment({
  test: UNIT2L3_TEST,
  questions: UNIT2L3_QUESTIONS,
  diagramMarkup: unit2l3AssessmentDiagram,
  loadSolutions: () => import('./unit2-lesson3-test-solutions.js'),
  solutionGroupSize: 5,
  welcome: {
    sourceRange: '97–106',
    description: 'اختبار مستقل من 20 سؤالاً يقيس فرق الكمون وأجهزة القياس ودارات التسلسل والتفرع والتحويلات والتفكير التطبيقي.',
    topics: ['فرق الكمون والرمز U', 'الفولتميتر والتوصيل على التفرع', 'التسلسل والتفرع', 'تحويل الوحدات', 'تطبيقات المحول'],
    solutionsHeading: 'حلول الاختبارات',
    solutionsDescription: 'بعد التسليم، افتح الحلول على دفعات من خمسة أسئلة مع الإجابة وخطوات التفسير.',
  },
});
