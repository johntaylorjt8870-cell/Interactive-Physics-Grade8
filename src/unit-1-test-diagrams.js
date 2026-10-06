import { assessmentDiagramMarkup } from './lesson-test-diagrams.js';
import { lesson2AssessmentDiagram } from './lesson-2-test-diagrams.js';
export function unit1AssessmentDiagram(question){ return assessmentDiagramMarkup(question) || lesson2AssessmentDiagram(question); }
