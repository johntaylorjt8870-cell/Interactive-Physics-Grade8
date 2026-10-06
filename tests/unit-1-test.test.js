import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { UNIT_1_QUESTIONS, UNIT_1_TEST } from '../src/unit-1-test-data.js';
import { ANSWER_KEY, SOLUTIONS, SOLUTION_GROUPS } from '../src/unit-1-test-solutions.js';
import { createAssessmentState, recordAnswer, restartAssessment, startAssessment, submitAssessment, validateAnswerKey } from '../src/lesson-test-engine.js';
const read=(path)=>readFile(new URL(path,import.meta.url),'utf8');

test('authorized Unit 1 Test exists with exactly 60 unique questions and balanced lesson coverage',async()=>{
 const [home,page,build]=await Promise.all([read('../index.html'),read('../unit-1-test.html'),read('../scripts/build.mjs')]);
 assert.equal(UNIT_1_QUESTIONS.length,60); assert.equal(new Set(UNIT_1_QUESTIONS.map(q=>q.id)).size,60); assert.equal(UNIT_1_QUESTIONS.filter(q=>q.coverage==='lesson1').length,30); assert.equal(UNIT_1_QUESTIONS.filter(q=>q.coverage==='lesson2').length,30);
 assert.match(home,/href="\.\/unit-1-test\.html"/); assert.match(page,/اختبار الوحدة الأولى/); assert.match(page,/src="\.\/src\/unit-1-assessment\.js"/); assert.match(build,/'unit-1-test\.html'/); assert.equal(UNIT_1_TEST.unit,'الوحدة الأولى — الحركة والقوى');
});

test('Unit 1 questions span both page ranges, varied formats, calculations, diagrams and reasoning',()=>{
 const types=new Set(UNIT_1_QUESTIONS.map(q=>q.type)); for(const type of ['single-choice','true-false','multiple-select','numeric','ordering','matching','error-analysis','diagram-interpretation']) assert.ok(types.has(type));
 assert.ok(UNIT_1_QUESTIONS.some(q=>q.sourcePages.some(p=>p>=55&&p<=62))); assert.ok(UNIT_1_QUESTIONS.some(q=>q.sourcePages.some(p=>p>=63&&p<=70)));
 assert.ok(UNIT_1_QUESTIONS.filter(q=>q.type==='numeric').length>=15); assert.ok(UNIT_1_QUESTIONS.some(q=>q.diagram)); assert.ok(UNIT_1_QUESTIONS.some(q=>q.difficulty==='thinking'));
});

test('Unit 1 has valid explanatory solutions in six groups of ten',()=>{
 assert.deepEqual(SOLUTION_GROUPS.map(group=>group.items.length),[10,10,10,10,10,10]); assert.equal(Object.keys(ANSWER_KEY).length,60); assert.equal(Object.keys(SOLUTIONS).length,60);
 for(const q of UNIT_1_QUESTIONS){assert.equal(validateAnswerKey(q,ANSWER_KEY[q.id]),true,q.id);assert.ok(SOLUTIONS[q.id].explanationHtml.length>45,q.id);}
});

test('Unit 1 scoring stays hidden until submit and restart removes all 60-question state',()=>{
 let state=startAssessment(createAssessmentState()); for(const q of UNIT_1_QUESTIONS.slice(0,3)) state=recordAnswer(state,q,ANSWER_KEY[q.id]); assert.equal(state.results,null); assert.equal(state.status,'in-progress');
 state=submitAssessment(state,UNIT_1_QUESTIONS,ANSWER_KEY); assert.equal(state.results.total,60); assert.equal(state.results.correct,3); assert.equal(state.results.incorrect,57);
 assert.deepEqual(restartAssessment(state),{status:'not-started',currentIndex:0,answers:{},results:null});
});

test('Unit 1 answer key is not loaded before explicit submission and no future unit test is exposed',async()=>{
 const [app,home]=await Promise.all([read('../src/unit-1-assessment.js'),read('../index.html')]); assert.doesNotMatch(app,/ANSWER_KEY|answerKey:/); assert.match(app,/loadSolutions: \(\) => import\('\.\/unit-1-test-solutions\.js'\)/); assert.doesNotMatch(home,/unit-2-test|اختبار الوحدة الثانية|Unit 2 Test/);
});
