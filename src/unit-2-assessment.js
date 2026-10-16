import { mountAssessment } from './assessment-runtime.js';
import { UNIT_2_TEST, UNIT_2_QUESTIONS } from './unit-2-test-data.js';
import { unit2AssessmentDiagram } from './unit-2-test-diagrams.js';
mountAssessment({
 test:UNIT_2_TEST, questions:UNIT_2_QUESTIONS, diagramMarkup:unit2AssessmentDiagram,
 loadSolutions:()=>import('./unit-2-test-solutions.js'), solutionGroupSize:10,
 welcome:{sourceRange:'73–120',description:'اختبار الوحدة الثانية: 56 سؤالاً جديداً من المنصة، لا نسخ لأسئلة الكتاب. يغطي الدروس الأربعة بعد اكتمالها، مع مفاهيم وحسابات وقراءة رسوم وتحليل أخطاء.',topics:['الكهرباء الساكنة · 12 سؤالاً','التيار المتواصل · 12 سؤالاً','فرق الكمون · 12 سؤالاً','المقاومة الكهربائية · 20 سؤالاً'],resultTitle:'نتيجة اختبار الوحدة الثانية',solutionsHeading:'حلول الاختبارات',solutionsDescription:'حلول مستقلة بتفسير وخطوات حساب، تظهر بعد التسليم النهائي على دفعات من عشرة أسئلة.'}
});
