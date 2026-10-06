import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderTeacherContent } from '../src/lesson-2-teacher-content.js';
const read=(path)=>readFile(new URL(path,import.meta.url),'utf8');
const markup=renderTeacherContent();

test('Lesson 2 Teacher Area uses the existing protected gate and lazy-loads only its own content',async()=>{
 const [html,boot]=await Promise.all([read('../lesson-2-teacher.html'),read('../src/lesson-2-teacher.js')]);
 assert.match(html,/type="password"[^>]*autocomplete="current-password"/); assert.match(html,/id="teacher-workspace"[^>]*hidden/); assert.match(html,/src="\.\/src\/lesson-2-teacher\.js"/); assert.match(boot,/verifyTeacherPassword/); assert.match(boot,/import\('\.\/lesson-2-teacher-content\.js'\)/); assert.doesNotMatch(html,/somer173/);
});

test('teacher disclosures cover every source page p63–p70',()=>{for(let p=63;p<=70;p++){assert.ok(markup.includes(`data-source-page="p${p}"`),`missing p${p}`);assert.ok(markup.includes(`محتوى الكتاب الأصلي · p${p}`),`missing visible p${p}`);}});

test('teacher area solves all activities and both textbook problems with data, law, substitution, units and checks',()=>{
 for(const phrase of ['تجربة تعريف القوى المتوازية','تجربة محصلة قوتين بجهة واحدة','علاقة التناسب وسؤال «أفكر»','الانتقال إلى الجهتين المتعاكستين','تطبيق الجهة الواحدة','تطبيق الجهتين المتعاكستين','السؤال الثاني · المسألة الأولى','السؤال الثاني · المسألة الثانية']) assert.ok(markup.includes(phrase),phrase);
 for(const value of ['50~\\mathrm{N}','0.2~\\mathrm{m}','100~\\mathrm{N}','180~\\mathrm{cm}','150~\\mathrm{cm}','160}{3}']) assert.ok(markup.includes(value),value);
 assert.match(markup,/المعطيات:/); assert.match(markup,/المطلوب/); assert.match(markup,/القانون والتعويض|التعويض/); assert.match(markup,/التحقق/); assert.match(markup,/أخطاء شائعة/);
});

test('teacher content preserves uncertain-source boundaries rather than inventing apparatus wording',()=>{assert.match(markup,/Reference \/ See textbook — p64/); assert.match(markup,/اسم الأداة الأولى[^]*لا تخمّن/); assert.match(markup,/تعليمات تبديل الثقل[^]*لا تعِد صياغتها كنص كتاب حرفي/);});
