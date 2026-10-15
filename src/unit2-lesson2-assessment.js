import { mountAssessment } from './assessment-runtime.js';
import { UNIT2L2_TEST, UNIT2L2_QUESTIONS } from './unit2-lesson2-test-data.js';
import { unit2l2AssessmentDiagram } from './unit2-lesson2-test-diagrams.js';
mountAssessment({
  test: UNIT2L2_TEST,
  questions: UNIT2L2_QUESTIONS,
  diagramMarkup: unit2l2AssessmentDiagram,
  loadSolutions: () => import('./unit2-lesson2-test-solutions.js'),
  solutionGroupSize: 5,
  welcome: {
    sourceRange: '87–96',
    description: 'اختبار جديد من 20 سؤالاً يقيس التيار المتواصل وجهته وشدة التيار والتسلسل والتفرع.',
    topics: ['التيار المتواصل', 'جهة التيار', 'I = q/t', 'التسلسل', 'التفرع'],
  },
});
