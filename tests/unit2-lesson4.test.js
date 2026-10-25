import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { LESSON, STATIONS, OHM_TABLE, SELF_CHECK_POINTS, UNIT2L4_PAGES, UNIT2L4_PHASES } from '../src/unit2-lesson4-content.js';
import { auditLessonSteps } from '../src/lesson-steps.js';
import { unit2l4StepMarkup } from '../src/unit2-lesson4-step-view.js';
import { ACTIVITIES } from '../src/unit2-lesson4-activities.js';
import { TEACHER_ANSWERS, renderTeacherContent } from '../src/unit2-lesson4-teacher-content.js';
import { ohmCurrent, wireResistance, squareCentimetresToMetres, equivalentResistance, network, colourResistance, graphSlope } from '../src/unit2-lesson4-physics.js';
import { UNIT_2_TEST, UNIT_2_QUESTIONS, BLUEPRINT } from '../src/unit-2-test-data.js';
import { ANSWER_KEY, SOLUTIONS, SOLUTION_GROUPS } from '../src/unit-2-test-solutions.js';
import { createAssessmentState, startAssessment, recordAnswer, submitAssessment, restartAssessment, validateAnswerKey, answerIsCorrect, canRevealSolutions, canRevealResults } from '../src/lesson-test-engine.js';
import { verifyTeacherPassword } from '../src/teacher-auth.js';
import { graph, circuit } from '../src/unit2-lesson4-diagrams.js';
import { unit2AssessmentDiagram } from '../src/unit-2-test-diagrams.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('official lesson 4 title and all printed pp107–120 are taught once as fourteen book steps in six phases',()=>{
 assert.equal(LESSON.title,'المقاومة الكهربائية');assert.equal(STATIONS.length,6);
 assert.deepEqual(LESSON.pages,Array.from({length:14},(_,i)=>107+i));
 assert.deepEqual(STATIONS.flatMap(s=>s.pages),LESSON.pages);
 /* The station shell (one long rail with six copied HTML documents) was rebuilt as
    one step per book page. The six phases keep the book's own unit grouping and the
    structural audit replaces the old `html.length` check: each phase must still own
    real book copy for every page it claims, with no gap or repeat. */
 assert.equal(UNIT2L4_PAGES.length,14);
 assert.deepEqual(UNIT2L4_PAGES.map(page=>page.page),LESSON.pages);
 assert.deepEqual(auditLessonSteps(UNIT2L4_PAGES,{sourcePages:LESSON.sourcePages}).problems,[]);
 for(const phase of UNIT2L4_PHASES){
  const pages=UNIT2L4_PAGES.filter(page=>page.phase===phase.id);
  assert.deepEqual(pages.map(page=>page.page),phase.pages,phase.id);
  const text=pages.flatMap(page=>page.blocks.filter(block=>block.type==='book').map(block=>block.html)).join(' ')
    .replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  assert.ok(text.length>400,`${phase.id} keeps real book copy for every page it owns`);
 }
});
test('course has four correctly ordered Unit 2 lessons before exposing the Unit 2 test',async()=>{
 const home=await read('index.html');const section=home.slice(home.indexOf('aria-label="دروس الوحدة الثانية"'),home.indexOf('id="available-tests"'));
 assert.deepEqual([...section.matchAll(/href="\.\/unit2-lesson-(\d)\.html"/g)].map(m=>+m[1]),[1,2,3,4]);
 assert.match(home,/أربعة دروس · الوحدة مكتملة/);assert.match(home,/href="\.\/unit-2-test\.html"/);
 for(let i=1;i<=4;i++)await access(new URL(`../unit2-lesson-${i}.html`,import.meta.url));
});
test('source image records exist for all fourteen actually inspected pages',async()=>{for(let i=1;i<=14;i++)await access(new URL(`../docs/sources/unit2-lesson4/image-${i}.png`,import.meta.url));});
test('59 source demands each have a unique id, source page and a separate full teacher response',()=>{
 assert.equal(ACTIVITIES.length,59);assert.equal(new Set(ACTIVITIES.map(a=>a.id)).size,59);
 for(const a of ACTIVITIES){assert.equal(a.verified,true);assert.ok(LESSON.pages.includes(a.page));assert.ok(TEACHER_ANSWERS[a.id]?.length>45,a.id);}
 assert.deepEqual(new Set(Object.keys(TEACHER_ANSWERS)),new Set(ACTIVITIES.map(a=>a.id)));
});
test('self-check has 19 leaf demands: 3 MCQ, 3 graph, 4 matches, 3 explanations and 6 problem parts',()=>{
 assert.equal(ACTIVITIES.filter(a=>a.id.startsWith('q')).length,19);
 for(const prefix of ['q1','q2','q3','q4','q5a','q5b'])assert.equal(ACTIVITIES.filter(a=>a.id.startsWith(prefix)).length,prefix==='q3'?4:3);
 assert.equal(ACTIVITIES.filter(a=>a.page===120).length,13);
});
test('all printed five ohm-table columns independently give 4 ohms',()=>{
 assert.deepEqual(OHM_TABLE.map(p=>p.u),[2,4,6,8,12]);assert.deepEqual(OHM_TABLE.map(p=>p.i),[.5,1,1.5,2,3]);OHM_TABLE.forEach(p=>assert.equal(p.u/p.i,4));assert.equal(graphSlope({i:1,u:4},{i:4,u:16}),4);
});
test('self-check graph is 5 ohms, interpolates to 30 V at 6 A and keeps actual printed points distinct',()=>{
 assert.deepEqual(SELF_CHECK_POINTS.map(p=>[p.i,p.u]),[[2,10],[3,15],[5,25],[7,35],[9,45]]);assert.equal(graphSlope(SELF_CHECK_POINTS[0],SELF_CHECK_POINTS[4]),5);assert.equal(6*5,30);
});
test('cm squared conversion and textbook rho example preserve squared scale and units',()=>{
 assert.equal(squareCentimetresToMetres(30),.003);assert.equal(1000*.003/3,1);assert.equal(wireResistance(1,3,.003),1000);assert.ok(Math.abs(squareCentimetresToMetres(12)-.0012)<1e-15);
});
test('wire scales directly with length and rho, inversely with area',()=>{
 const r=wireResistance(2,3,4);assert.equal(wireResistance(2,6,4),2*r);assert.equal(wireResistance(2,3,8),r/2);assert.equal(wireResistance(4,3,4),2*r);assert.equal(wireResistance(2,6,8),r);
});
test('12 V and two 3 ohm textbook example is correct for both modes',()=>{
 assert.deepEqual(network(12,3,3,'series'),{r:6,i:2,i1:2,i2:2,u1:6,u2:6});assert.deepEqual(network(12,3,3,'parallel'),{r:1.5,i:8,i1:4,i2:4,u1:12,u2:12});
});
test('all p119–120 textbook numerical answers independently recalculate',()=>{
 assert.equal(ohmCurrent(12,equivalentResistance([2,2],'parallel')),12);
 assert.ok(Math.abs(equivalentResistance(Array(6).fill(6),'parallel')-1)<1e-12);
 assert.equal(equivalentResistance([100,200],'series'),300);const n=network(30,100,200,'series');assert.equal(n.i,.1);assert.equal(n.u1,10);assert.equal(n.u2,20);
 assert.equal(40/2,20);assert.equal(4*2,8);assert.equal(equivalentResistance(Array(4).fill(20),'parallel'),5);
});
test('new numerical assessment answers independently recalculate rather than only matching option ids',()=>{
 const values={9:9e9*2e-6*3e-6/.3**2,15:18/6,16:.25*2*60,17:48/.8,20:1.8-.650,28:1.25*1000,29:75/1000,30:18-3-7,39:10/.4,40:9/15,45:12*1e-4,46:30*.002/2,48:7+5,49:1/(1/6+1/12)};
 for(const [id,value] of Object.entries(values))assert.ok(Math.abs(ANSWER_KEY['u2-'+id].value-value)<1e-10,id);
});
test('positive resistor networks obey series and parallel conservation across many settings',()=>{
 for(const mode of ['series','parallel'])for(const a of [1,3,7,12])for(const b of [1,2,6,11]){const n=network(12,a,b,mode);assert.ok(n.r>0);if(mode==='parallel'){assert.ok(n.r<Math.min(a,b));assert.ok(Math.abs(n.i-n.i1-n.i2)<1e-12);}else{assert.equal(n.i1,n.i2);assert.ok(Math.abs(n.u1+n.u2-12)<1e-12);}}
});
test('invalid physical inputs cannot silently create NaN, infinity or a divide-by-zero',()=>{
 for(const x of [0,-1,NaN,Infinity]){assert.throws(()=>ohmCurrent(6,x));assert.throws(()=>wireResistance(1,2,x));}
 assert.throws(()=>equivalentResistance([],'series'));assert.throws(()=>equivalentResistance([1],'mixed'));assert.throws(()=>graphSlope({i:1,u:1},{i:1,u:2}));assert.equal(ohmCurrent(0,3),0);
});
test('four-band practice calculations and unresolved original figure are distinguished',()=>{
 assert.equal(colourResistance(4,7,2),4700);assert.equal(colourResistance(1,5,3),15000);assert.throws(()=>colourResistance(10,1,2));
 assert.match(TEACHER_ANSWERS['p116-2'],/تعارض|لا نجزم/);assert.match(TEACHER_ANSWERS['p116-2'],/خمس/);
});
test('LED correction, fixed-temperature ohmic condition and the unresolved colour figure stay explicit platform explanations',()=>{
 /* These platform corrections used to live inside the six station HTML strings. They
    now sit next to the page they explain (p117 LED, p118 ohmic condition, p116 colour
    figure), so the same four ideas are asserted on the step content instead. */
 const pageText=page=>UNIT2L4_PAGES.filter(entry=>entry.page===page)
   .flatMap(entry=>entry.blocks.filter(block=>block.type==='book'||block.type==='platform').map(block=>block.html))
   .join(' ').replace(/<[^>]+>/g,' ');
 assert.match(pageText(118),/ثابت الحرارة/);
 assert.match(pageText(117),/إعادة اتحاد|تعيد اتحاد/);
 assert.match(pageText(117),/تحديد\S* للتيار/);
 /* the platform-voice label itself must say the note is not a quotation */
 assert.match(unit2l4StepMarkup(UNIT2L4_PAGES.find(entry=>entry.page===117)),/شرح المنصة · لا اقتباس/);
 assert.match(pageText(116),/لا نجزم/);
 assert.match(pageText(116),/خمس/);
});
test('56 unique new unit-test prompts cover every lesson according to the blueprint',()=>{
 assert.equal(UNIT_2_QUESTIONS.length,56);assert.equal(UNIT_2_TEST.id,'unit2');assert.equal(new Set(UNIT_2_QUESTIONS.map(q=>q.id)).size,56);assert.equal(new Set(UNIT_2_QUESTIONS.map(q=>q.prompt)).size,56);
 for(let i=1;i<=4;i++)assert.equal(UNIT_2_QUESTIONS.filter(q=>q.coverage===`lesson${i}`).length,BLUEPRINT[`lesson${i}`]);
 assert.equal(UNIT_2_QUESTIONS.filter(q=>q.type==='numeric').length,14);assert.equal(UNIT_2_QUESTIONS.filter(q=>q.diagram).length,2);
});
test('every assessment key is valid and each separate solution has a meaningful explanation',()=>{
 for(const q of UNIT_2_QUESTIONS){assert.ok(validateAnswerKey(q,ANSWER_KEY[q.id]),q.id);assert.ok(SOLUTIONS[q.id].explanationHtml.length>80,q.id);assert.ok(q.sourcePages.length);}
 assert.equal(SOLUTION_GROUPS.flatMap(g=>g.items).length,56);
});
test('score and solutions remain hidden until submission, including after answer edits',()=>{
 let s=startAssessment(createAssessmentState());const q=UNIT_2_QUESTIONS[0];s=recordAnswer(s,q,'a');assert.equal(canRevealResults(s),false);assert.equal(canRevealSolutions(s),false);s=recordAnswer(s,q,'b');assert.equal(s.results,null);
 s=submitAssessment(s,UNIT_2_QUESTIONS,ANSWER_KEY);assert.equal(s.results.correct,1);assert.equal(s.results.total,56);assert.equal(canRevealResults(s),true);assert.equal(canRevealSolutions(s),true);assert.equal(s.answers[q.id],'b');assert.equal(restartAssessment().results,null);
});
test('fully correct 56-question submission and all numerics grade as intended',()=>{
 let s=startAssessment(createAssessmentState());for(const q of UNIT_2_QUESTIONS){const k=ANSWER_KEY[q.id];const response=q.type==='numeric'?String(k.value):k;assert.equal(answerIsCorrect(q,response,k),true,q.id);s=recordAnswer(s,q,response);}
 s=submitAssessment(s,UNIT_2_QUESTIONS,ANSWER_KEY);assert.equal(s.results.correct,56);assert.equal(s.results.incorrect,0);
});
test('teacher and test solutions remain in separate lazy-loaded areas, never in student boot',async()=>{
 const student=await read('src/unit2-lesson4-main.js'),boot=await read('src/unit-2-assessment.js'),teacher=await read('src/unit2-lesson4-teacher.js');
 assert.doesNotMatch(student,/teacher-content|test-solutions|TEACHER_ANSWERS/);assert.match(teacher,/import\('\.\/unit2-lesson4-teacher-content.js'\)/);assert.doesNotMatch(teacher,/unit-2-test-solutions/);assert.match(boot,/loadSolutions:\(\)=>import\('\.\/unit-2-test-solutions.js'\)/);assert.doesNotMatch(boot,/ANSWER_KEY|answerKey:/);assert.match(renderTeacherContent(),/teacher-q5b3/);
});
test('existing password remains somer173 without changing shared authentication',async()=>{assert.equal(await verifyTeacherPassword('somer173'),true);assert.equal(await verifyTeacherPassword('incorrect'),false);});
test('math islands, charts, native controls, focus and reduced motion are supported',async()=>{
 const css=await read('src/unit2-lesson4.css'),practice=await read('src/unit2-lesson4-practice.js');assert.match(css,/prefers-reduced-motion/);assert.match(css,/focus-visible/);assert.match(css,/unicode-bidi:isolate/);
 /* Reset and live feedback moved from the old station boot into the practice layer,
    which now owns every native form control. */
 assert.match(practice,/data-r4p-action="reset"/);assert.match(practice,/role="status"/);
 assert.match(graph(OHM_TABLE),/<title/);assert.match(graph(OHM_TABLE),/<desc/);assert.match(circuit('parallel'),/العقدتين/);for(const q of UNIT_2_QUESTIONS.filter(q=>q.diagram))assert.match(unit2AssessmentDiagram(q),/role="img"/);
 assert.doesNotMatch(UNIT2L4_PAGES.map(page=>unit2l4StepMarkup(page)).join(''),/katex-error/);
});
test('production build registers every new HTML entry without replacing previous ones',async()=>{
 const build=await read('scripts/build.mjs');for(const f of ['unit2-lesson-4.html','unit2-lesson-4-teacher.html','unit-2-test.html','unit2-lesson-3.html','unit2-lesson-2.html','unit2-lesson-1.html'])assert.ok(build.includes(`'${f}'`),f);
});
test('published content, appendix content and tests for lessons 1–3 retain their baseline bytes',async()=>{
 const {createHash}=await import('node:crypto');const fixture=JSON.parse(await read('tests/fixtures/unit2-prior-content-sha256.json'));
 for(const [path,hash] of Object.entries(fixture))assert.equal(createHash('sha256').update(await read(path)).digest('hex'),hash,path);
});
test('core new palette text pairs meet WCAG AA normal-text contrast',()=>{
 const luminance=hex=>{const c=hex.replace('#','').match(/../g).map(h=>parseInt(h,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
 for(const [fg,bg] of [['#173a30','#f4f2e9'],['#ffffff','#123b30'],['#ffffff','#286049'],['#7e431e','#ffffff'],['#536356','#f4f2e9'],['#173a30','#e4e9dc']]){const a=luminance(fg),b=luminance(bg);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${fg} on ${bg}`);}
});
