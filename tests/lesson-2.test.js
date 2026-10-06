import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LESSON_2_PAGES, LESSON_2_META } from '../src/lesson-2-content.js';
import { LESSON_2_DIAGRAMS } from '../src/lesson-2-diagrams.js';
import { momentProducts, oppositeSenseParallelResultant, sameSenseParallelResultant } from '../src/lesson-2-physics.js';

const read=(path)=>readFile(new URL(path,import.meta.url),'utf8');
const source=(page)=>LESSON_2_PAGES.find((item)=>item.page===page).blocks.filter((block)=>block.type==='book').map((block)=>block.html).join('');

test('Lesson 2 has a stable RTL entry, eight sequential textbook pages, and no future lesson',async()=>{
 const [html,main,build]=await Promise.all([read('../lesson-2.html'),read('../src/lesson-2-main.js'),read('../scripts/build.mjs')]);
 assert.match(html,/<html lang="ar" dir="rtl">/); assert.match(html,/القوى المتوازية/); assert.match(html,/ص 63–70/);
 assert.match(html,/src="\.\/src\/lesson-2-main\.js"/); assert.match(html,/href="\.\/lesson-2-test\.html"/); assert.match(html,/href="\.\/lesson-2-teacher\.html"/); assert.match(html,/href="\.\/unit-1-test\.html"/);
 assert.deepEqual(LESSON_2_PAGES.map((item)=>item.page),[63,64,65,66,67,68,69,70]); assert.equal(LESSON_2_META.pages,'63–70');
 assert.match(main,/goToPage\(0\)/); assert.match(build,/'lesson-2\.html'/); assert.doesNotMatch(html,/lesson-3|الدرس 3/);
});

test('all source pages expose exact objectives, definitions, laws, values, and page 70 tasks',()=>{
 const p63=source(63),p64=source(64),p65=source(65),p66=source(66),p67=source(67),p68=source(68),p70=source(70);
 for(const phrase of ['يتعرّف القوى المتوازية.','يحدّد عناصر محصلة قوتين متوازيتين بجهة واحدة.','يمثّل بالرسم القوى المتوازية ومحصلتها.','قوتان متوازيتان.']) assert.ok(p63.includes(phrase));
 assert.match(p64,/القوى المتوازية:<\/strong> هي القوى التي تكون حواملها مستقيمات متوازية/); assert.match(p64,/Reference \/ See textbook — p64/);
 for(const tex of ['F_{1}\\times d_{1}=F_{2}\\times d_{2}','F=F_{1}+F_{2}']) assert.ok(p65.includes(tex));
 for(const value of ['0.5~\\mathrm{m}','20~\\mathrm{N}','30~\\mathrm{N}','50~\\mathrm{N}']) assert.ok((p66+p67).includes(value));
 assert.ok(p67.includes('F=F_{2}-F_{1}'));
 for(const value of ['60~\\mathrm{cm}','200~\\mathrm{N}','300~\\mathrm{N}','100~\\mathrm{N}','180~\\mathrm{cm}']) assert.ok(p68.includes(value));
 for(const value of ['40~\\mathrm{N}','10~\\mathrm{N}','80~\\mathrm{N}','20~\\mathrm{N}','40~\\mathrm{cm}']) assert.ok(p70.includes(value));
 assert.match(p70,/المسألة الأولى/); assert.match(p70,/المسألة الثانية/); assert.equal((p70.match(/class="question-item"/g)??[]).length,4);
});

test('Lesson 2 includes all textbook activities plus one bounded educational simulation',()=>{
 const combined=LESSON_2_PAGES.flatMap((page)=>page.blocks);
 assert.equal(combined.filter((block)=>block.type==='simulation').length,1);
 assert.equal(combined.find((block)=>block.type==='simulation').id,'parallel-resultant-lab');
 assert.ok(source(63).includes('كيف تكون قوى شد السلاسل للأرجوحة؟'));
 assert.ok(source(64).includes('هل لحاملي قوتي شد الربيعتين الاستقامة ذاتها؟'));
 assert.ok(source(65).includes('أحسب الجداءين'));
 assert.ok(source(66).includes('أين تستقر النقطة'));
 assert.ok(source(70).includes('حدّد بالكتابة والرسم عناصر محصلة'));
});

test('parallel-force physics places same-sense resultant inside and opposite-sense resultant outside',()=>{
 const same=sameSenseParallelResultant(20,30,0.5); assert.equal(same.magnitude,50); assert.equal(same.distanceFromF2,0.2); assert.equal(same.position,0.3);
 const opposite=oppositeSenseParallelResultant(200,300,60); assert.equal(opposite.magnitude,100); assert.equal(opposite.position,180); assert.equal(opposite.distanceFromF2,120); assert.equal(opposite.sense,-1);
 assert.deepEqual(momentProducts(200,180,300,120),{first:36000,second:36000,balanced:true});
 const equal=oppositeSenseParallelResultant(20,20,40); assert.equal(equal.hasFiniteResultant,false); assert.equal(equal.position,null);
});

test('reconstructed diagrams are descriptive vectors with source-relevant points and no decorative image substitution',()=>{
 assert.deepEqual(Object.keys(LESSON_2_DIAGRAMS),['parallel-definition','same-sense','opposite-sense']);
 for(const diagram of Object.values(LESSON_2_DIAGRAMS)){assert.match(diagram.svg,/<svg[^]*role="img"/);assert.match(diagram.svg,/<title/);assert.match(diagram.svg,/<desc/);assert.ok(diagram.description.length>20);}
 assert.match(LESSON_2_DIAGRAMS['same-sense'].svg,/>C</); assert.match(LESSON_2_DIAGRAMS['opposite-sense'].svg,/>A</); assert.doesNotMatch(LESSON_2_DIAGRAMS['same-sense'].svg,/<img/);
});

test('Lesson 2 CSS and interactivity preserve focus, RTL isolation, reduced motion, labels, and live status',async()=>{
 const [css,simulation,main]=await Promise.all([read('../src/lesson-2.css'),read('../src/lesson-2-simulation.js'),read('../src/lesson-2-main.js')]);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/); assert.match(simulation,/aria-live="polite"/); assert.match(simulation,/Educational simplified model/); assert.match(simulation,/type="radio"/); assert.match(simulation,/type="range"/); assert.match(simulation,/prefers-reduced-motion: reduce/); assert.match(main,/dir="ltr"/);
});
