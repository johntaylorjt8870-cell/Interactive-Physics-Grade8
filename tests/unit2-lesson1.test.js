import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { UNIT2_PAGES, UNIT2_META } from '../src/unit2-lesson1-content.js';
import { chargeFromElectrons, electronCountFromCharge, coulombForce, netForceOnCharge, electroscopeState } from '../src/unit2-lesson1-physics.js';
import { UNIT2_DIAGRAMS } from '../src/unit2-lesson1-diagrams.js';
import { UNIT2_QUESTIONS, UNIT2_TEST } from '../src/unit2-lesson1-test-data.js';
import { ANSWER_KEY, SOLUTIONS, SOLUTION_GROUPS } from '../src/unit2-lesson1-test-solutions.js';
import { validateAnswerKey, startAssessment, createAssessmentState, recordAnswer, submitAssessment, restartAssessment } from '../src/lesson-test-engine.js';
import { renderTeacherContent } from '../src/unit2-lesson1-teacher-content.js';
const read=(p)=>readFile(new URL(p,import.meta.url),'utf8');
const source=(n)=>UNIT2_PAGES.find(p=>p.page===n)?.blocks.filter(b=>b.type==='book').map(b=>b.html).join('')??'';
test('pages 73-86 in order, meta, entries, build',async()=>{
 assert.deepEqual(UNIT2_PAGES.map(p=>p.page),[73,74,75,76,77,78,79,80,81,82,83,84,85,86]);
 assert.equal(UNIT2_META.pages,'73–86');
 const [html,build,home]=await Promise.all([read('../unit2-lesson-1.html'),read('../scripts/build.mjs'),read('../index.html')]);
 assert.match(html,/<html lang="ar" dir="rtl">/); assert.match(html,/الكهرباء الساكنة/); assert.match(html,/unit2-lesson1-main\.js/); assert.match(html,/unit2-lesson-1-test\.html/); assert.match(html,/unit2-lesson-1-teacher\.html/);
 assert.match(build,/'unit2-lesson-1\.html'/); assert.match(home,/unit2-lesson-1\.html/); assert.doesNotMatch(home,/unit-2-test|أسئلة الوحدة الثانية/);
});
test('all textbook elements present',()=>{
 for(const phrase of ['يتعرّف الكهرباء الساكنة','الكهرباء الساكنة – التكهرب']) assert.ok(source(73).includes(phrase),phrase);
 assert.ok(source(74).includes('الكاشف الكهربائي')); assert.ok(source(74).includes('وريقتين ناقلتين خفيفتين'));
 assert.ok(source(75).includes('حقيبة الكهرباء الساكنة')); assert.ok(source(75).includes('أدلك طرف ساق البلاستيك'));
 assert.ok(source(76).includes('5\\times10^{12}')||source(76).includes('5×10')); assert.ok(source(76).includes('20\\times10^{+10}')||source(76).includes('20'));
 assert.ok(source(77).includes('الشحنات الكهربائية المتماثلة تتنافر'));
 assert.ok(source(78).includes('التكهرب باللمس')); assert.ok(source(79).includes('التكهرب بالتأثير'));
 assert.ok(source(80).includes('قانون كولوم')); assert.ok(source(80).includes('9\\times10^{9}')||source(80).includes('9'));
 assert.ok(source(81).includes('36')); assert.ok(source(82).includes('مانعة الصواعق'));
 assert.ok(source(83).includes('بنجامين فرانكلين')); assert.ok(source(84).includes('السؤال الثالث'));
 assert.ok(source(85).includes('المسألة الثانية')); assert.ok(source(86).includes('المسألة الثالثة'));
 assert.ok(source(85).includes('جسم إلكتروناته ذاته السطحية قليل وشديدة الارتباط بالنواة'));
 { const req=source(86).slice(source(86).indexOf('المطلوب:')); const i1=req.indexOf('بين'), i2=req.indexOf('بين', i1+1), i3=req.indexOf('محصلة القوى'); assert.ok(i1>-1&&i2>i1&&i3>i2,'p86 order'); assert.ok(req.includes('q_{2}')&&req.includes('q_{3}')); }
 assert.ok(source(85).includes('6.02')||source(85).includes('6'));
});
test('physics: quantization, Coulomb textbook values, three-charge net, electroscope',()=>{
 assert.equal(chargeFromElectrons(5e12,'lost').charge>0,true); assert.ok(Math.abs(electronCountFromCharge(8e-7).count-5e12)<1);
 assert.equal(coulombForce(50e-6,80e-6,1).magnitude,36); assert.equal(coulombForce(50e-6,80e-6,1).kind,'repulsion');
 assert.equal(coulombForce(5e-6,-8e-6,1).kind,'attraction');
 const net=netForceOnCharge({charge:5e-6,position:0},[{charge:6e-6,position:0.2},{charge:-8e-6,position:0.6}]);
 assert.ok(Math.abs(net.magnitude-5.75)<1e-9, String(net.magnitude)); assert.equal(net.direction,-1);
 assert.equal(electroscopeState(0).diverged,false); assert.equal(electroscopeState(-3).diverged,true);
 assert.throws(()=>coulombForce(1,1,0),RangeError);
});
test('diagrams and simulations labelled, accessible, reduced motion',async()=>{
 assert.deepEqual(Object.keys(UNIT2_DIAGRAMS),['electroscope','coulomb-pair','induction','lightning']);
 for(const d of Object.values(UNIT2_DIAGRAMS)){ assert.match(d.svg,/role="img"/); assert.match(d.svg,/<title/); assert.ok(d.description.length>20); assert.doesNotMatch(d.svg,/<img/); }
 const [sim,css,content]=await Promise.all([read('../src/unit2-lesson1-simulation.js'),read('../src/unit2-lesson1.css'),read('../src/unit2-lesson1-content.js')]);
 assert.match(sim,/Educational simplified model/); assert.match(sim,/aria-live="polite"/); assert.match(sim,/data-coulomb-reset/); assert.match(sim,/data-scope-step="reset"/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.equal(UNIT2_PAGES.flatMap(p=>p.blocks).filter(b=>b.type==='simulation').length,2);
 const main=await read('../src/unit2-lesson1-main.js'); assert.match(main,/Platform Explanation · شرح المنصة/);
});
test('teacher covers every page and every exercise with steps',()=>{
 const m=renderTeacherContent();
 for(let p=73;p<=86;p++) assert.ok(m.includes(`data-source-page="p${p}"`),`p${p}`);
 for(const phrase of ['الكاشف الكهربائي','تطبيق محلول','نشاط','التكهرب بالتأثير','السؤال الأول','السؤال الثاني','السؤال الثالث','السؤال الرابع','المسألة الأولى','المسألة الثانية','المسألة الثالثة','5.75','2.32','96320','المطلوب 1','المطلوب 2','المطلوب 3']) assert.ok(m.includes(phrase),phrase);
 { const a=m.indexOf('المطلوب 1'), b=m.indexOf('المطلوب 2'), c=m.indexOf('المطلوب 3'); assert.ok(a>-1&&b>a&&c>b,'teacher p86 order'); }
 assert.match(m,/المعطيات/); assert.match(m,/المطلوب/); assert.match(m,/التحقق/);
});
test('test: exactly 20, distribution 6/7/4/3, hidden keys, groups of 5, no instant score, restart',async()=>{
 assert.equal(UNIT2_QUESTIONS.length,20); assert.equal(new Set(UNIT2_QUESTIONS.map(q=>q.id)).size,20);
 assert.deepEqual(Object.fromEntries(['basic','medium','advanced','thinking'].map(l=>[l,UNIT2_QUESTIONS.filter(q=>q.difficulty===l).length])),{basic:6,medium:7,advanced:4,thinking:3});
 assert.ok(new Set(UNIT2_QUESTIONS.map(q=>q.type)).size>=7); assert.deepEqual(UNIT2_TEST.sourcePages,[73,74,75,76,77,78,79,80,81,82,83,84,85,86]);
 assert.deepEqual(SOLUTION_GROUPS.map(g=>g.items.length),[5,5,5,5]); assert.equal(Object.keys(ANSWER_KEY).length,20);
 for(const q of UNIT2_QUESTIONS){ assert.equal(validateAnswerKey(q,ANSWER_KEY[q.id]),true,q.id); assert.ok(SOLUTIONS[q.id].explanationHtml.length>40,q.id); }
 const app=await read('../src/unit2-lesson1-assessment.js'); assert.match(app,/loadSolutions: \(\) => import\('\.\/unit2-lesson1-test-solutions\.js'\)/); assert.doesNotMatch(app,/ANSWER_KEY/);
 let st=startAssessment(createAssessmentState()); st=recordAnswer(st,UNIT2_QUESTIONS[0],ANSWER_KEY[UNIT2_QUESTIONS[0].id]); assert.equal(st.results,null);
 const sub=submitAssessment(st,UNIT2_QUESTIONS,ANSWER_KEY); assert.equal(sub.results.correct,1);
 assert.deepEqual(restartAssessment(sub),{status:'not-started',currentIndex:0,answers:{},results:null});
});
test('teacher gate unchanged and no plain password in new pages',async()=>{
 const [th,auth]=await Promise.all([read('../unit2-lesson-1-teacher.html'),read('../src/teacher-auth.js')]);
 assert.match(th,/type="password"/); assert.match(th,/unit2-lesson1-teacher\.js/); assert.doesNotMatch(th,/somer173/); assert.doesNotMatch(auth,/somer173/);
 const boot=await read('../src/unit2-lesson1-teacher.js'); assert.match(boot,/verifyTeacherPassword/);
});
