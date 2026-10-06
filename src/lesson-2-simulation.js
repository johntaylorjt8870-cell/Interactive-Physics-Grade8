import { V_F, V_F1, V_F2, formula, ltrText } from './math.js';
import { oppositeSenseParallelResultant, sameSenseParallelResultant } from './lesson-2-physics.js';

const fmt = (value, digits = 2) => String(Number(Number(value).toFixed(digits)));

export function lesson2SimulationMarkup(id) {
  if (id !== 'parallel-resultant-lab') return '';
  return `<aside class="simulation-experience lesson2-simulation" data-lesson2-simulation="parallel-resultant-lab" aria-labelledby="parallel-lab-title">
    <header class="simulation-header">
      <div><span class="simulation-badge">تجربة تفاعلية</span><span class="simulation-model-label">Educational simplified model</span></div>
      <h3 id="parallel-lab-title">مختبر موضع محصلة قوتين متوازيتين</h3>
      <p>غيّر الشدتين والمسافة والجهتين؛ يتحدث الرسم والحساب معاً. النموذج تعليمي هندسي ولا يحاكي مرونة المسطرة أو الربائع.</p>
    </header>
    <div class="simulation-workbench">
      <section class="simulation-controls" aria-label="ضوابط القوى المتوازية">
        <fieldset class="parallel-mode-control">
          <legend>جهتا القوتين</legend>
          <label><input type="radio" name="parallel-mode" value="same" checked data-parallel-mode /> جهة واحدة</label>
          <label><input type="radio" name="parallel-mode" value="opposite" data-parallel-mode /> جهتان متعاكستان</label>
        </fieldset>
        ${range('parallel-f1', 'مقدار القوة الأولى', V_F1, 5, 80, 5, 20, 'N')}
        ${range('parallel-f2', 'مقدار القوة الثانية', V_F2, 5, 80, 5, 30, 'N')}
        ${range('parallel-distance', 'المسافة بين الحاملين', ltrText('d'), 10, 100, 5, 50, 'cm')}
        <button class="simulation-sweep" type="button" data-parallel-sweep aria-describedby="parallel-sweep-help"><span aria-hidden="true">▶</span> شاهد نقطة المحصلة تتحرك</button>
        <p class="simulation-sweep-hint" id="parallel-sweep-help">تزداد القوة الثانية تدريجياً، فتتحرك نقطة تأثير المحصلة وفق العلاقة.</p>
        <div class="simulation-result-grid">
          <div class="simulation-result-cell"><span>شدة المحصلة</span><output class="simulation-result-value" data-parallel-result><bdi dir="ltr">50 N</bdi></output></div>
          <div class="simulation-result-cell"><span>موضع المحصلة</span><output class="simulation-result-value" data-parallel-position>بين القوتين</output></div>
        </div>
        <div class="simulation-status" role="status" aria-live="polite" aria-atomic="true" data-parallel-status>تقع المحصلة بين القوتين وأقرب إلى القوة الثانية الأكبر.</div>
      </section>
      <figure class="simulation-visual">
        <div class="simulation-svg-wrap">
          <svg viewBox="0 0 720 390" role="img" aria-labelledby="parallel-svg-title parallel-svg-desc">
            <title id="parallel-svg-title">تغير موضع محصلة قوتين متوازيتين</title>
            <desc id="parallel-svg-desc" data-parallel-description>قوتان متوازيتان في جهة واحدة، ومحصلتهما بينهما.</desc>
            <defs>
              <marker id="parallel-green-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#168b78"/></marker>
              <marker id="parallel-red-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#d45f50"/></marker>
              <marker id="parallel-blue-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#33568f"/></marker>
            </defs>
            <line x1="90" y1="225" x2="630" y2="225" class="parallel-lab-bar"/>
            <line x1="190" y1="42" x2="190" y2="340" class="parallel-lab-carrier"/>
            <line x1="530" y1="42" x2="530" y2="340" class="parallel-lab-carrier"/>
            <line data-vector="f1" x1="190" y1="225" x2="190" y2="130" class="parallel-lab-force f1" marker-end="url(#parallel-green-arrow)"/>
            <line data-vector="f2" x1="530" y1="225" x2="530" y2="95" class="parallel-lab-force f2" marker-end="url(#parallel-red-arrow)"/>
            <line data-result-carrier x1="360" y1="35" x2="360" y2="350" class="parallel-lab-result-carrier"/>
            <line data-vector="result" x1="360" y1="225" x2="360" y2="72" class="parallel-lab-force result" marker-end="url(#parallel-blue-arrow)"/>
            <circle data-result-point cx="360" cy="225" r="7" class="parallel-lab-result-point"/>
            <text x="190" y="365" class="diagram-point-label" text-anchor="middle" direction="ltr">A</text>
            <text x="530" y="365" class="diagram-point-label" text-anchor="middle" direction="ltr">B</text>
            <text data-result-label x="360" y="365" class="diagram-point-label result-label" text-anchor="middle" direction="ltr">C</text>
            <text x="165" y="115" class="parallel-svg-force-label" direction="ltr">F1</text>
            <text data-f2-label x="555" y="82" class="parallel-svg-force-label" direction="ltr">F2</text>
            <text data-result-symbol x="382" y="64" class="parallel-svg-force-label result" direction="ltr">F</text>
          </svg>
        </div>
        <figcaption data-parallel-caption>في الجهة الواحدة: ${formula('F=F_{1}+F_{2}','F equals F one plus F two')}</figcaption>
      </figure>
    </div>
  </aside>`;
}

function range(id, label, symbol, min, max, step, value, unit) {
  return `<div class="simulation-control">
    <div class="simulation-control-heading"><label for="${id}">${label} ${symbol}</label><output id="${id}-value" class="simulation-control-value" for="${id}"><bdi dir="ltr">${value} ${unit}</bdi></output></div>
    <input class="simulation-range" id="${id}" data-parallel-input type="range" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${label}" aria-valuetext="${value} ${unit}"/>
    <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">${min} ${unit}</bdi><bdi dir="ltr">${max} ${unit}</bdi></div>
  </div>`;
}

function geometryPosition(result, distance) {
  const physical = [0, distance];
  if (Number.isFinite(result.position)) physical.push(result.position);
  const min = Math.min(...physical);
  const max = Math.max(...physical);
  const span = Math.max(max - min, 1);
  const map = (x) => 105 + ((x - min) / span) * 510;
  return { f1: map(0), f2: map(distance), result: Number.isFinite(result.position) ? map(result.position) : 360 };
}

function setVector(line, x, magnitude, sense, marker) {
  const length = Math.min(145, 54 + magnitude * 1.1);
  line.setAttribute('x1', String(x));
  line.setAttribute('x2', String(x));
  line.setAttribute('y1', '225');
  line.setAttribute('y2', String(225 - (sense * length)));
  line.setAttribute('marker-end', `url(#${marker})`);
}

export function mountLesson2Simulations(scope) {
  for (const lab of scope.querySelectorAll('[data-lesson2-simulation="parallel-resultant-lab"]')) {
    const f1Input = lab.querySelector('#parallel-f1');
    const f2Input = lab.querySelector('#parallel-f2');
    const distanceInput = lab.querySelector('#parallel-distance');
    const modes = [...lab.querySelectorAll('[data-parallel-mode]')];
    const f1Line = lab.querySelector('[data-vector="f1"]');
    const f2Line = lab.querySelector('[data-vector="f2"]');
    const resultLine = lab.querySelector('[data-vector="result"]');
    const resultCarrier = lab.querySelector('[data-result-carrier]');
    const resultPoint = lab.querySelector('[data-result-point]');
    const resultLabel = lab.querySelector('[data-result-label]');
    const resultSymbol = lab.querySelector('[data-result-symbol]');
    const f2Label = lab.querySelector('[data-f2-label]');
    const resultOutput = lab.querySelector('[data-parallel-result]');
    const positionOutput = lab.querySelector('[data-parallel-position]');
    const status = lab.querySelector('[data-parallel-status]');
    const caption = lab.querySelector('[data-parallel-caption]');
    const description = lab.querySelector('[data-parallel-description]');
    let animationFrame = null;

    const update = () => {
      const F1 = Number(f1Input.value);
      const F2 = Number(f2Input.value);
      const d = Number(distanceInput.value);
      const mode = modes.find((input) => input.checked)?.value ?? 'same';
      const opposite = mode === 'opposite';
      const result = opposite ? oppositeSenseParallelResultant(F1, F2, d) : sameSenseParallelResultant(F1, F2, d);
      const points = geometryPosition(result, d);
      const f1Sense = 1;
      const f2Sense = opposite ? -1 : 1;
      const resultSense = opposite ? result.sense : 1;
      setVector(f1Line, points.f1, F1, f1Sense, 'parallel-green-arrow');
      setVector(f2Line, points.f2, F2, f2Sense, 'parallel-red-arrow');
      f2Label.setAttribute('x', String(points.f2 + 25));
      f2Label.setAttribute('y', String(f2Sense > 0 ? Math.max(55, 214 - Math.min(145, 54 + F2 * 1.1)) : 350));
      const finite = result.position !== null;
      [resultLine, resultCarrier, resultPoint, resultLabel, resultSymbol].forEach((element) => { element.style.opacity = finite ? '1' : '0'; });
      if (finite) {
        setVector(resultLine, points.result, result.magnitude, resultSense, 'parallel-blue-arrow');
        resultCarrier.setAttribute('x1', String(points.result)); resultCarrier.setAttribute('x2', String(points.result));
        resultPoint.setAttribute('cx', String(points.result));
        resultLabel.setAttribute('x', String(points.result));
        resultSymbol.setAttribute('x', String(points.result + 23));
        resultSymbol.setAttribute('y', String(resultSense > 0 ? Math.max(48, 214 - Math.min(145, 54 + result.magnitude * 1.1)) : 350));
      }
      f1Input.nextElementSibling;
      lab.querySelector('#parallel-f1-value').innerHTML = `<bdi dir="ltr">${fmt(F1)} N</bdi>`;
      lab.querySelector('#parallel-f2-value').innerHTML = `<bdi dir="ltr">${fmt(F2)} N</bdi>`;
      lab.querySelector('#parallel-distance-value').innerHTML = `<bdi dir="ltr">${fmt(d)} cm</bdi>`;
      f1Input.setAttribute('aria-valuetext', `${fmt(F1)} N`);
      f2Input.setAttribute('aria-valuetext', `${fmt(F2)} N`);
      distanceInput.setAttribute('aria-valuetext', `${fmt(d)} cm`);
      resultOutput.innerHTML = `<bdi dir="ltr">${fmt(result.magnitude)} N</bdi>`;
      if (!finite) {
        positionOutput.textContent = 'لا توجد محصلة مفردة محدودة الموضع';
        status.textContent = 'القوتان متساويتان ومتعاكستان وعلى حاملين مختلفين؛ يظهر أثر دوراني ولا تمثله قوة مفردة محدودة الموضع.';
        description.textContent = 'قوتان متوازيتان متساويتان ومتعاكستان، ولا تظهر محصلة مفردة محدودة الموضع.';
      } else if (!opposite) {
        positionOutput.innerHTML = `على بعد <bdi dir="ltr">${fmt(result.distanceFromF1)} cm</bdi> من القوة الأولى`;
        const closer = F1 === F2 ? 'في منتصف المسافة لأن القوتين متساويتان.' : `بين القوتين وأقرب إلى القوة ${F1 > F2 ? 'الأولى' : 'الثانية'} الأكبر.`;
        status.textContent = `تقع المحصلة ${closer}`;
        description.textContent = `قوتان متوازيتان في جهة واحدة، ومحصلتهما بينهما على بعد ${fmt(result.distanceFromF1)} سنتيمتراً من القوة الأولى.`;
      } else {
        positionOutput.innerHTML = `على بعد <bdi dir="ltr">${fmt(result.distanceFromF1)} cm</bdi> من القوة الأولى`;
        const larger = F1 > F2 ? 'الأولى' : 'الثانية';
        status.textContent = `تقع المحصلة خارج القطعة ومن جهة القوة ${larger} الأكبر، وتتجه بجهتها.`;
        description.textContent = `قوتان متوازيتان متعاكستان، ومحصلتهما خارج القطعة من جهة القوة ${larger}.`;
      }
      caption.innerHTML = opposite
        ? `في الجهتين المتعاكستين: ${formula('F=\\lvert F_{1}-F_{2}\\rvert','F equals the absolute difference of F one and F two')}`
        : `في الجهة الواحدة: ${formula('F=F_{1}+F_{2}','F equals F one plus F two')}`;
    };

    [...modes, f1Input, f2Input, distanceInput].forEach((input) => input.addEventListener('input', update));
    lab.querySelector('[data-parallel-sweep]').addEventListener('click', () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) { f2Input.value = f2Input.max; update(); f2Input.focus(); return; }
      const start = performance.now();
      const min = Number(f2Input.min); const max = Number(f2Input.max); const duration = 2200;
      const animate = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const wave = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;
        f2Input.value = String(Math.round((min + (max - min) * wave) / Number(f2Input.step)) * Number(f2Input.step));
        update();
        if (progress < 1) animationFrame = requestAnimationFrame(animate);
        else { animationFrame = null; f2Input.focus(); }
      };
      animationFrame = requestAnimationFrame(animate);
    });
    update();
  }
}
