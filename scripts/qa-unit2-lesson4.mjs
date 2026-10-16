// Optional real-browser QA. Install playwright-core and @sparticuz/chromium outside
// the repository, then set QA_MODULE_DIR to that installation's node_modules.
// Serve dist on QA_BASE_URL (default http://127.0.0.1:4173).
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { UNIT_2_QUESTIONS } from '../src/unit-2-test-data.js';
import { ANSWER_KEY } from '../src/unit-2-test-solutions.js';
const require=createRequire(process.env.QA_MODULE_DIR?`${process.env.QA_MODULE_DIR}/qa-entry.cjs`:import.meta.url);
const {chromium:pw}=require('playwright-core');
const Chrome=(await import(require.resolve('@sparticuz/chromium'))).default;
const browser=await pw.launch({executablePath:await Chrome.executablePath(),args:Chrome.args.filter(arg=>!['--single-process','--disable-web-security','--allow-running-insecure-content'].includes(arg)),headless:true});
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const out=new URL('../docs/qa/unit2-lesson4/',import.meta.url);await mkdir(out,{recursive:true});
const results=[];let checks=0;const failures=[];
const check=(condition,message)=>{assert.ok(condition,message);checks++;};
try{
 for(const viewport of [{width:1366,height:768},{width:1440,height:900}]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'});const page=await context.newPage();const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>requests.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});page.on('requestfailed',r=>errors.push(`${r.failure()?.errorText} ${r.url()}`));
  const overflow=async(label)=>{const sizes=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));check(sizes.scroll<=sizes.width,`${label}: horizontal overflow ${JSON.stringify(sizes)}`);};
  const exercisePrediction=async()=>{const form=page.locator('.prediction');const answer=await form.getAttribute('data-answer');const wrong=await form.locator(`input[type=radio]:not([value="${answer}"])`).first().getAttribute('value');await form.locator(`input[value="${wrong}"]`).check();await form.locator('[type=submit]').click();check(await form.locator('.feedback.error').count()===1,'station wrong explanation');await form.locator('[type=reset]').click();check(await form.locator('.feedback').isHidden(),'station prediction reset');await form.locator(`input[value="${answer}"]`).check();await form.locator('[type=submit]').click();check((await form.locator('.feedback').innerText()).includes('صحيح'),'station correct explanation');};
  await page.goto(base+'/unit2-lesson-4.html');await page.waitForSelector('#heat-reading .katex');await page.evaluate(()=>document.fonts.ready);
  await overflow('heat');check((await page.locator('#heat-reading').innerText()).includes('1'),'initial 1 amp');
  await page.locator('#added-r').fill('6');check((await page.locator('#heat-reading').innerText()).includes('0.5'),'added 6 ohms -> half amp');
  await page.locator('#heat-reset').click();check(await page.locator('#added-r').inputValue()==='0','heat reset');
  await page.locator('input[name="heat-p"][value="up"]').check();await page.locator('.prediction button[type=submit]').click();check(await page.locator('.feedback.error').count()===1,'wrong feedback');
  await page.locator('.prediction button[type=reset]').click();check(await page.locator('.feedback').isHidden(),'prediction reset');
  await page.locator('input[name="heat-p"][value="down"]').check();await page.locator('.prediction button[type=submit]').click();check((await page.locator('.feedback').innerText()).includes('صحيح'),'correct feedback');
  await page.evaluate(()=>scrollTo(0,0));check((await page.locator('.station-rail small').boundingBox()).y+(await page.locator('.station-rail small').boundingBox()).height<=viewport.height,'complete sidebar including progress fits laptop height');await page.screenshot({path:new URL(`lesson-${viewport.width}.png`,out).pathname});
  await page.locator('#activity-p107-devices summary').click();await page.locator('#answer-p107-devices').fill('ملاحظات اختبار الحفظ');await page.reload();await page.waitForSelector('#heat-reading');check(await page.locator('#answer-p107-devices').inputValue()==='ملاحظات اختبار الحفظ','notebook persists on reload');
  await page.locator('#station-nav a[href="#ohm"]').click();await page.waitForSelector('#ohm-reading');await page.locator('#ohm-u').fill('8');check((await page.locator('#ohm-reading').innerText()).includes('2'),'ohm readout');await page.locator('#ohm-reset').click();check(await page.locator('#ohm-u').inputValue()==='4','ohm reset');await exercisePrediction();await overflow('ohm');
  await page.locator('#station-nav a[href="#wire"]').click();await page.waitForSelector('#wire-reading');await page.locator('#wire-l').fill('6');check((await page.locator('#wire-reading').innerText()).includes('2'),'wire doubling');await page.locator('#wire-reset').click();check(await page.locator('#wire-l').inputValue()==='3','wire reset');await exercisePrediction();await overflow('wire');
  await page.locator('#station-nav a[href="#network"]').click();await page.waitForSelector('#network-reading');check((await page.locator('#network-reading').innerText()).includes('6'),'series 6 ohm');await page.locator('#network-mode').selectOption('parallel');check((await page.locator('#network-reading').innerText()).includes('1.5'),'parallel 1.5 ohm');check((await page.locator('#network-reading').innerText()).includes('8'),'parallel 8 amp');await exercisePrediction();await overflow('network');
  await page.screenshot({path:new URL(`network-${viewport.width}.png`,out).pathname});await page.locator('#network-reset').click();check(await page.locator('#network-mode').inputValue()==='series','network reset');
  await page.locator('#station-nav a[href="#components"]').click();await page.waitForSelector('#colour-reading');check((await page.locator('#colour-reading').innerText()).includes('4700'),'four band practice 4700');await page.locator('#colour-A').selectOption('1');await page.locator('#colour-reset').click();check(await page.locator('#colour-A').inputValue()==='4','colour reset');await exercisePrediction();await overflow('components');
  await page.locator('#station-nav a[href="#practice"]').click();await page.waitForSelector('#self-check-graph-title',{state:'attached'});check(await page.locator('.book-activity').count()===19,'all 19 self-check demands');await page.locator('#activity-q5b3 summary').click();await exercisePrediction();await overflow('practice');check((await page.locator('#progress-text').innerText()).includes('6 / 6'),'visited progress');
  check(await page.locator('.katex-error').count()===0,'no KaTeX errors');check(!requests.some(u=>u.includes('teacher-content')),'no teacher solutions requested in student area');
  // Gate failure, success and logout, and all 59 independent worked solutions.
  await page.goto(base+'/unit2-lesson-4-teacher.html');await page.waitForSelector('#teacher-login');check(await page.locator('#teacher-workspace').isHidden(),'teacher initially locked');
  check(!requests.some(u=>u.includes('unit2-lesson4-teacher-content')),'teacher content not loaded before login');
  await page.locator('#teacher-password').fill('incorrect');await page.locator('#teacher-login-submit').click();await page.waitForSelector('#teacher-auth-message:not([hidden])');check(await page.locator('#teacher-workspace').isHidden(),'wrong password rejected');
  await page.locator('#teacher-password').fill('somer173');await page.locator('#teacher-login-submit').click();await page.waitForSelector('#teacher-q5b3');check(await page.locator('.teacher-subsection[data-source-page]').count()===59,'59 teacher responses');await overflow('teacher');
  await page.screenshot({path:new URL(`teacher-${viewport.width}.png`,out).pathname});await page.locator('[data-teacher-logout]').click();check(await page.locator('#teacher-workspace').isHidden(),'logout hides answers');
  // All 56 questions, edits, navigation, explicit submission, solution groups.
  await page.goto(base+'/unit-2-test.html');await page.waitForSelector('[data-action=start]');await page.locator('[data-action=start]').click();
  check(!requests.some(u=>u.includes('unit-2-test-solutions')),'no assessment solutions before submission');
  await page.locator('#u2-1-a').check();check(await page.locator('.assessment-results').count()===0,'no immediate results after wrong choice');await page.locator('#u2-1-b').check();
  for(let i=0;i<UNIT_2_QUESTIONS.length;i++){
   const q=UNIT_2_QUESTIONS[i],key=ANSWER_KEY[q.id];
   if(q.type==='numeric')await page.locator('[data-answer-control=numeric]').fill(String(key.value));else await page.locator(`#${q.id}-${key}`).check();
   await overflow('test question '+(i+1));
   if(i===0){await page.locator('[data-action=next]').click();await page.locator('[data-action=previous]').click();check(await page.locator('#u2-1-b').isChecked(),'answer survives next/previous');}
   if(i<UNIT_2_QUESTIONS.length-1)await page.locator('[data-action=next]').click();
  }
  check(!requests.some(u=>u.includes('unit-2-test-solutions')),'solutions still unloaded after all answers');
  await page.locator('[data-action=attempt-submit]').first().click();await page.locator('[data-dialog-action=cancel-submit]').click();check(await page.locator('.assessment-results').count()===0,'cancel submit keeps test in progress');
  await page.locator('[data-action=attempt-submit]').first().click();await page.locator('[data-dialog-action=confirm-submit]').click();await page.waitForSelector('#results-title');check((await page.locator('.result-score-main').innerText()).includes('56/56'),'latest edited responses produce 56/56');check(await page.locator('.solution-item').count()===56,'56 worked test solutions');check(await page.locator('.solution-group').count()===6,'6 solution groups');await overflow('test results');
  for(const s of await page.locator('.solution-group summary').all())await s.click();await overflow('expanded solutions');await page.screenshot({path:new URL(`test-results-${viewport.width}.png`,out).pathname});
  await page.locator('[data-action=restart]').click();await page.locator('[data-dialog-action=cancel-restart]').click();check(await page.locator('.result-score-main').count()===1,'cancel restart preserves result');await page.locator('[data-action=restart]').click();await page.locator('[data-dialog-action=confirm-restart]').click();check(await page.locator('.assessment-results').count()===0,'restart clears result');
  // Regression smoke checks only; not a claim of full visual re-audit of earlier lessons.
  for(const file of ['index.html','unit2-lesson-1.html','unit2-lesson-2.html','unit2-lesson-3.html','unit-1-test.html']){await page.goto(base+'/'+file);await page.waitForLoadState('networkidle');await overflow(file);check(await page.locator('main').count()>0,`regression ${file}`);}
  check(errors.length===0,`console/network errors: ${errors.join('; ')}`);results.push({viewport,consoleErrors:errors,requests:requests.length,status:'passed'});await context.close();
 }
 // Compact viewport plus keyboard-only navigation of stages.
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();await page.goto(base+'/unit2-lesson-4.html#network');await page.waitForSelector('#network-mode');check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile no horizontal overflow');await page.locator('#station-nav a[href="#components"]').focus();await page.keyboard.press('Enter');await page.waitForSelector('#colour-A');check(await page.locator('#station-nav a[aria-current=step]').getAttribute('href')==='#components','keyboard station navigation');await context.close();
} catch(error){failures.push(String(error.stack||error));throw error;}
finally{await writeFile(new URL('browser-results.json',out),JSON.stringify({date:'2026-10-17',browser:await browser.version(),checks,results,failures},null,2)+'\n');await browser.close();console.log(JSON.stringify({checks,results,failures},null,2));}
