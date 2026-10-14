import { mountAssessment } from './assessment-runtime.js';
import { UNIT2_TEST, UNIT2_QUESTIONS } from './unit2-lesson1-test-data.js';
import { unit2AssessmentDiagram } from './unit2-lesson1-test-diagrams.js';
mountAssessment({
  test: UNIT2_TEST,
  questions: UNIT2_QUESTIONS,
  diagramMarkup: unit2AssessmentDiagram,
  loadSolutions: () => import('./unit2-lesson1-test-solutions.js'),
  solutionGroupSize: 5,
  welcome: {
    sourceRange: '73–86',
    description: 'اختبار جديد من 20 سؤالاً يقيس الكاشف الكهربائي والتكهرب بالدلك واللمس والتأثير وقانون كولوم والتفريغ الكهربائي.',
    topics: ['الكاشف الكهربائي', 'التكهرب بالدلك', 'اللمس والتأثير', 'قانون كولوم', 'البرق والتفريغ'],
  },
});
