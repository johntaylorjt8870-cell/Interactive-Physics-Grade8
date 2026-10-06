import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LESSON_2_QUESTIONS, LESSON_2_TEST } from '../src/lesson-2-test-data.js';
import { ANSWER_KEY, SOLUTIONS, SOLUTION_GROUPS } from '../src/lesson-2-test-solutions.js';
import { answerIsCorrect, createAssessmentState, recordAnswer, restartAssessment, startAssessment, submitAssessment, validateAnswerKey } from '../src/lesson-test-engine.js';
const read=(path)=>readFile(new URL(path,import.meta.url),'utf8');

test('Lesson 2 Test contains exactly 20 new varied questions with the requested difficulty distribution',()=>{
 assert.equal(LESSON_2_QUESTIONS.length,20); assert.equal(new Set(LESSON_2_QUESTIONS.map(q=>q.id)).size,20);
 assert.deepEqual(Object.fromEntries(['basic','medium','advanced','thinking'].map(level=>[level,LESSON_2_QUESTIONS.filter(q=>q.difficulty===level).length])),{basic:6,medium:7,advanced:4,thinking:3});
 assert.ok(new Set(LESSON_2_QUESTIONS.map(q=>q.type)).size>=7); assert.deepEqual(LESSON_2_TEST.sourcePages,[63,64,65,66,67,68,69,70]);
 assert.ok(LESSON_2_QUESTIONS.every(q=>q.lessonId==='unit1-lesson2'));
});

test('Lesson 2 answer keys are hidden in a separate module and solutions are four groups of five',async()=>{
 const app=await read('../src/lesson-2-assessment.js'); assert.doesNotMatch(app,/ANSWER_KEY|answerKey:/); assert.match(app,/loadSolutions: \(\) => import\('\.\/lesson-2-test-solutions\.js'\)/);
 assert.deepEqual(SOLUTION_GROUPS.map(group=>group.items.length),[5,5,5,5]); assert.equal(Object.keys(ANSWER_KEY).length,20); assert.equal(Object.keys(SOLUTIONS).length,20);
 for(const q of LESSON_2_QUESTIONS){assert.equal(validateAnswerKey(q,ANSWER_KEY[q.id]),true,q.id);assert.ok(SOLUTIONS[q.id].explanationHtml.length>60,q.id);}
});

test('Lesson 2 assessment does not score on selection and reveals totals only after submit',()=>{
 let state=startAssessment(createAssessmentState()); const first=LESSON_2_QUESTIONS[0]; state=recordAnswer(state,first,ANSWER_KEY[first.id]); assert.equal(state.results,null); assert.equal(state.status,'in-progress');
 const submitted=submitAssessment(state,LESSON_2_QUESTIONS,ANSWER_KEY); assert.equal(submitted.status,'submitted'); assert.equal(submitted.results.correct,1); assert.equal(submitted.results.incorrect,19); assert.equal(answerIsCorrect(first,state.answers[first.id],ANSWER_KEY[first.id]),true);
});

test('Lesson 2 restart clears the complete attempt',()=>{let state=startAssessment(createAssessmentState());state=recordAnswer(state,LESSON_2_QUESTIONS[0],ANSWER_KEY.l2q01);state=submitAssessment(state,LESSON_2_QUESTIONS,ANSWER_KEY);const clean=restartAssessment(state);assert.deepEqual(clean,{status:'not-started',currentIndex:0,answers:{},results:null});});

test('Lesson 2 Test page is separate, RTL, and has submit/restart confirmation behavior',async()=>{const [html,runtime]=await Promise.all([read('../lesson-2-test.html'),read('../src/assessment-runtime.js')]);assert.match(html,/<html lang="ar" dir="rtl">/);assert.match(html,/src="\.\/src\/lesson-2-assessment\.js"/);assert.doesNotMatch(html,/<iframe/);assert.match(runtime,/تأكيد تسليم الاختبار/);assert.match(runtime,/مسح الإجابات والبدء من جديد/);assert.match(runtime,/state\.results/);});
