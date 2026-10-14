import { formula } from './math.js';
import { coulombForce, electroscopeState } from './unit2-lesson1-physics.js';
const fmt=(v)=>{ if(v===0) return '0'; const a=Math.abs(v); if(a>=1000||a<0.01) return v.toExponential(2); return String(Number(v.toFixed(3))); };
export function unit2SimulationMarkup(id){
 if(id==='coulomb-lab') return `<aside class="simulation-experience u2-sim" data-u2-sim="coulomb" aria-labelledby="coulomb-lab-title">
  <header class="simulation-header"><div><span class="simulation-badge">تجربة تفاعلية</span><span class="simulation-model-label">Educational simplified model · نموذج تعليمي مبسّط</span></div>
  <h3 id="coulomb-lab-title">مختبر قانون كولوم</h3><p>غيّر مقداري الشحنتين وإشارتيهما والمسافة، ولاحظ كيف تتغير شدة القوة ونوعها. تنبأ أولاً: ماذا يحدث إذا ضاعفت المسافة؟</p></header>
  <div class="simulation-workbench"><section class="simulation-controls" aria-label="ضوابط كولوم">
   ${sel('cq1sign','إشارة q1',[['1','موجبة +'],['-1','سالبة −']],'1')}${rng('cq1','مقدار q1',1,20,1,5,'μC')}
   ${sel('cq2sign','إشارة q2',[['1','موجبة +'],['-1','سالبة −']],'1')}${rng('cq2','مقدار q2',1,20,1,5,'μC')}
   ${rng('cd','المسافة d',10,100,5,50,'cm')}
   <button class="simulation-sweep" type="button" data-coulomb-reset>إعادة الضبط</button>
   <div class="simulation-result-grid"><div class="simulation-result-cell"><span>شدة القوة F</span><output class="simulation-result-value" data-coulomb-f><bdi dir="ltr">—</bdi></output></div>
   <div class="simulation-result-cell"><span>نوع القوة</span><output class="simulation-result-value" data-coulomb-kind>—</output></div></div>
   <div class="simulation-status" role="status" aria-live="polite" data-coulomb-status></div>
   <p class="u2-predict">تحقق: مضاعفة d تجعل F ربع ما كانت عليه، لأن العلاقة مع مربع المسافة عكسية.</p>
  </section>
  <figure class="simulation-visual"><div class="simulation-svg-wrap"><svg viewBox="0 0 720 320" role="img" aria-labelledby="cs-title cs-desc"><title id="cs-title">شحنتان وقوة كولوم</title><desc id="cs-desc" data-coulomb-desc>شحنتان على مستقيم واحد.</desc>
   <line x1="80" y1="160" x2="640" y2="160" class="u2-carrier"/><circle data-cq1c cx="220" cy="160" r="30" class="u2-plus"/><circle data-cq2c cx="500" cy="160" r="30" class="u2-minus"/>
   <text data-cq1t x="220" y="168" class="u2-svg-sign" text-anchor="middle">+</text><text data-cq2t x="500" y="168" class="u2-svg-sign" text-anchor="middle">+</text>
   <line data-ca1 x1="190" y1="160" x2="120" y2="160" class="u2-force-r" marker-end="url(#cu2r)"/><line data-ca2 x1="530" y1="160" x2="600" y2="160" class="u2-force-r" marker-end="url(#cu2r)"/>
   <defs><marker id="cu2r" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#c95348"/></marker><marker id="cu2b" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#33568f"/></marker></defs>
   <text x="360" y="130" class="u2-label" text-anchor="middle" direction="ltr">d</text><text data-cfl x="360" y="230" class="u2-label" text-anchor="middle">F = K·q1·q2 / d²</text></svg></div>
  <figcaption data-coulomb-caption>${formula('F=K\\frac{q_{1}q_{2}}{d^{2}}','F equals K q1 q2 over d squared')}</figcaption></figure></div></aside>`;
 if(id==='electroscope-lab') return `<aside class="simulation-experience u2-sim" data-u2-sim="scope" aria-labelledby="scope-lab-title">
  <header class="simulation-header"><div><span class="simulation-badge">تجربة تفاعلية</span><span class="simulation-model-label">Educational simplified model · نموذج تعليمي مبسّط</span></div>
  <h3 id="scope-lab-title">مختبر الكاشف الكهربائي والتكهرب بالتأثير</h3><p>نفّذ الخطوات بالترتيب كما في الكتاب ص79: قرّب، أبعد، قرّب والمس، ثم أبعد الإصبع والساق. الزاوية هنا توضيحية وليست قياساً معايراً لشحنة حقيقية.</p></header>
  <div class="simulation-workbench"><section class="simulation-controls" aria-label="خطوات الكاشف">
   <div class="u2-steps" role="group" aria-label="خطوات التجربة">
    <button type="button" data-scope-step="approach">1 · قرّب ساقاً سالبة دون لمس</button>
    <button type="button" data-scope-step="away">2 · أبعد الساق</button>
    <button type="button" data-scope-step="touch">3 · قرّب والمس القرص بالإصبع ثم أبعدهما</button>
    <button type="button" data-scope-step="touch-charge">4 · المس القرص بساق سالبة (تكهرب باللمس)</button>
    <button type="button" data-scope-step="reset">إعادة الضبط</button></div>
   <div class="simulation-result-grid"><div class="simulation-result-cell"><span>حالة الوريقتين</span><output class="simulation-result-value" data-scope-state>منطبقتان</output></div>
   <div class="simulation-result-cell"><span>شحنة الكاشف الصافية (نموذج)</span><output class="simulation-result-value" data-scope-charge><bdi dir="ltr">0 μC</bdi></output></div></div>
   <div class="simulation-status" role="status" aria-live="polite" data-scope-status>الكاشف معتدل: الوريقتان منطبقتان.</div>
  </section>
  <figure class="simulation-visual"><div class="simulation-svg-wrap"><svg viewBox="0 0 720 320" role="img" aria-labelledby="ss-title ss-desc"><title id="ss-title">كاشف كهربائي</title><desc id="ss-desc" data-scope-desc>وريقتان منطبقتان.</desc>
   <rect data-scope-rod x="90" y="60" width="150" height="28" rx="14" class="u2-rod-charge" opacity="0"/><text data-scope-rod-t x="165" y="80" class="u2-svg-sign" text-anchor="middle" opacity="0">− − −</text>
   <circle cx="360" cy="70" r="11" class="u2-metal"/><rect x="285" y="95" width="150" height="150" rx="55" class="u2-jar"/><line x1="360" y1="81" x2="360" y2="150" class="u2-rod"/>
   <line data-leaf-l x1="360" y1="150" x2="356" y2="215" class="u2-leaf"/><line data-leaf-r x1="360" y1="150" x2="364" y2="215" class="u2-leaf"/>
   <rect x="305" y="245" width="110" height="12" rx="6" class="u2-base"/><text data-scope-hand x="430" y="80" class="u2-label" opacity="0">إصبع (تأريض)</text></svg></div>
  <figcaption>انفراج الوريقتين يعني اكتسابهما شحنة متماثلة؛ لا يعني وحده معرفة إشارة الشحنة دون مقارنة بجسم معلوم الشحنة.</figcaption></figure></div></aside>`;
 return '';
}
function rng(id,label,min,max,step,val,unit){return `<div class="simulation-control"><div class="simulation-control-heading"><label for="${id}">${label}</label><output class="simulation-control-value" for="${id}"><bdi dir="ltr">${val} ${unit}</bdi></output></div><input class="simulation-range" id="${id}" data-u2-input type="range" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${label}"/><div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">${min} ${unit}</bdi><bdi dir="ltr">${max} ${unit}</bdi></div></div>`;}
function sel(id,label,opts,val){return `<div class="simulation-control"><label for="${id}">${label}</label><select id="${id}" data-u2-input>${opts.map(([v,t])=>`<option value="${v}"${v===val?' selected':''}>${t}</option>`).join('')}</select></div>`;}
export function mountUnit2Simulations(scope){
 scope.querySelectorAll('[data-u2-sim="coulomb"]').forEach((root)=>{
  const q=(s)=>root.querySelector(s); const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function update(){
   const q1=Number(q('#cq1sign').value)*Number(q('#cq1').value)*1e-6, q2=Number(q('#cq2sign').value)*Number(q('#cq2').value)*1e-6, d=Number(q('#cd').value)/100;
   root.querySelectorAll('[data-u2-input]').forEach((inp)=>{ const out=root.querySelector(`output[for="${inp.id}"]`); if(out&&inp.type==='range') out.innerHTML=`<bdi dir="ltr">${inp.value} ${inp.id==='cd'?'cm':'μC'}</bdi>`; });
   const r=coulombForce(q1,q2,d);
   q('[data-coulomb-f]').innerHTML=`<bdi dir="ltr">${fmt(r.magnitude)} N</bdi>`;
   q('[data-coulomb-kind]').textContent= r.kind==='repulsion'?'تنافر':r.kind==='attraction'?'تجاذب':'لا قوة';
   q('[data-coulomb-status]').textContent= r.kind==='repulsion'?'الشحنتان متماثلتان: تتنافران على الحامل نفسه وبقوتين متساويتين ومتعاكستين.':r.kind==='attraction'?'الشحنتان مختلفتان: تتجاذبان على الحامل نفسه.':'إحدى الشحنتين صفر: لا قوة متبادلة.';
   const s1=Math.sign(q1), s2=Math.sign(q2); q('[data-cq1t]').textContent=s1>0?'+':'−'; q('[data-cq2t]').textContent=s2>0?'+':'−';
   q('[data-cq1c]').setAttribute('class', s1>0?'u2-plus':'u2-minus'); q('[data-cq2c]').setAttribute('class', s2>0?'u2-plus':'u2-minus');
   const attract=r.kind==='attraction'; const a1=q('[data-ca1]'),a2=q('[data-ca2]'); const len=35+Math.min(55, Math.log10(r.magnitude+1)*10);
   if(attract){a1.setAttribute('x1','250');a1.setAttribute('x2',String(250+len));a2.setAttribute('x1','470');a2.setAttribute('x2',String(470-len));a1.setAttribute('class','u2-force-b');a2.setAttribute('class','u2-force-b');a1.setAttribute('marker-end','url(#cu2b)');a2.setAttribute('marker-end','url(#cu2b)');}
   else {a1.setAttribute('x1','190');a1.setAttribute('x2',String(190-len));a2.setAttribute('x1','530');a2.setAttribute('x2',String(530+len));a1.setAttribute('class','u2-force-r');a2.setAttribute('class','u2-force-r');a1.setAttribute('marker-end','url(#cu2r)');a2.setAttribute('marker-end','url(#cu2r)');}
   q('[data-coulomb-desc]').textContent=`شحنتان ${r.kind==='repulsion'?'متماثلتان تتنافران':r.kind==='attraction'?'مختلفتان تتجاذبان':'إحداهما صفر'} وشدة القوة ${fmt(r.magnitude)} نيوتن.`;
  }
  root.addEventListener('input',update); root.addEventListener('change',update);
  q('[data-coulomb-reset]').addEventListener('click',()=>{ q('#cq1sign').value='1';q('#cq2sign').value='1';q('#cq1').value='5';q('#cq2').value='5';q('#cd').value='50'; update(); });
  update();
 });
 scope.querySelectorAll('[data-u2-sim="scope"]').forEach((root)=>{
  const q=(s)=>root.querySelector(s); let net=0, induced=false;
  function render(msg){
   const st=electroscopeState(net); const ang= induced&&net===0? 28: st.angle; const dx=Math.sin(ang*Math.PI/180)*52, dy=Math.cos(ang*Math.PI/180)*65;
   q('[data-leaf-l]').setAttribute('x2',String(360-dx)); q('[data-leaf-l]').setAttribute('y2',String(150+dy));
   q('[data-leaf-r]').setAttribute('x2',String(360+dx)); q('[data-leaf-r]').setAttribute('y2',String(150+dy));
   q('[data-scope-state]').textContent= ang>1?'منفرجتان':'منطبقتان';
   q('[data-scope-charge]').innerHTML=`<bdi dir="ltr">${net} μC</bdi>`;
   q('[data-scope-status]').textContent=msg;
   q('[data-scope-desc]').textContent= ang>1?'وريقتان منفرجتان: الكاشف مشحون أو متأثر بجسم مشحون قريب.':'وريقتان منطبقتان: الكاشف معتدل.';
   q('[data-scope-rod]').setAttribute('opacity', induced||net!==0?'1':'0'); q('[data-scope-rod-t]').setAttribute('opacity', induced||net!==0?'1':'0');
  }
  root.addEventListener('click',(e)=>{ const b=e.target.closest('[data-scope-step]'); if(!b) return; const step=b.dataset.scopeStep;
   if(step==='approach'){induced=true; render('قربت الساق السالبة دون لمس: تجمعت الشحنات الموجبة في الطرف القريب والسالبة في البعيد، فانفرجت الوريقتان مؤقتا رغم أن الشحنة الصافية ما زالت صفرا.');}
   if(step==='away'){induced=false; if(net===0) render('أبعدت الساق: عاد التوزع متعادلا وانطبقت الوريقتان. هذا يثبت أن الانفراج في الخطوة 1 كان بالتأثير فقط.'); else render('أبعدت الساق: بقي الكاشف مشحونا فبقيت الوريقتان منفرجتين.');}
   if(step==='touch'){induced=false; net=4; render('قربت الساق السالبة ولمست القرص بالإصبع: تسربت الشحنات السالبة البعيدة إلى الأرض، ثم أبعدت الإصبع والساق فبقي الكاشف موجبا (شحنة مخالفة للمؤثر).');}
   if(step==='touch-charge'){induced=false; net=-5; render('لامست الساق السالبة القرص: انتقلت إلكترونات إلى الكاشف فأصبح سالبا (مماثلا بالنوع للجسم المشحون) وبقيت الوريقتان منفرجتين بعد الإبعاد.');}
   if(step==='reset'){induced=false; net=0; render('أعيد الضبط: الكاشف معتدل والوريقتان منطبقتان.');}
  });
  render('الكاشف معتدل: الوريقتان منطبقتان.');
 });
}
