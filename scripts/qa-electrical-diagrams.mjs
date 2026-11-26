/* Laptop-only audit. Start `npm start` at the checkout root. Then set
 * QA_MODULE_DIR to an installation containing playwright-core and CHROMIUM_PATH
 * to Chromium. No detached fixtures, injected diagrams, zoom or teacher unlocks.
 * Optional: QA_OUTPUT_DIR (default below), QA_MATCH (recapture matching names).
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const require = createRequire(
  process.env.QA_MODULE_DIR ? `${process.env.QA_MODULE_DIR}/entry.cjs` : import.meta.url,
);
const { chromium } = require('playwright-core');
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const out = process.env.QA_OUTPUT_DIR || 'docs/qa/electrical-diagrams-audit';
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const records = [],
  errors = [],
  notices = [];
try {
  for (const [width, height] of [
    [1366, 768],
    [1440, 900],
  ]) {
    const size = `${width}x${height}`,
      dir = join(out, size);
    await mkdir(dir, { recursive: true });
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
      locale: 'ar',
      reducedMotion: 'reduce',
    });
    page.setDefaultTimeout(6000);
    page.on('pageerror', (e) => errors.push(`${page.url()}: ${e.message}`));
    const go = async (path) => {
      await page.goto(`${base}/${path}.html`);
      await page.evaluate(() => document.fonts.ready);
    };
    const loc = (s) => page.locator(s).first();
    const click = (s) =>
      loc(s).evaluate((e) => {
        if (e.disabled) throw Error('Disabled: ' + e.outerHTML.slice(0, 100));
        e.click();
      });
    const step = (i) =>
      page
        .locator('#page-nav button')
        .nth(i)
        .evaluate((e) => e.click());
    const station = (id) => click(`[data-station-link="${id}"]`);
    const text = (s) => loc(s).textContent();
    const shown = (s) =>
      loc(s).evaluate((e) => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0);
    const snap = async (id, selector) => {
      if (process.env.QA_MATCH && !new RegExp(process.env.QA_MATCH).test(id)) return;
      const target = loc(selector);
      await target.waitFor({ state: 'attached' });
      await target.evaluate((e) => {
        for (let a = e.parentElement; a; a = a.parentElement) if (a.tagName === 'DETAILS') a.open = true;
        e.scrollIntoView({ block: 'center', behavior: 'instant' });
      });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      });
      const issues = await target.evaluate((e) => {
        const r = e.getBoundingClientRect();
        if (r.height > innerHeight && !e.matches('img[src$="notebook-p75.jpg"]'))
          throw Error(`Expected a whole diagram in the viewport: ${e.tagName} ${r.height}`);
        if (
          document.documentElement.dir !== 'rtl' ||
          r.width < 20 ||
          r.height < 15 ||
          r.left < -1 ||
          r.right > innerWidth + 1 ||
          (r.height <= innerHeight && (r.top < -1 || r.bottom > innerHeight + 1))
        )
          throw Error(`off-screen target: ${JSON.stringify(r.toJSON())}`);
        const svg = e.matches('svg') ? e : e.querySelector('svg');
        if (!svg) return [];
        const bounds = svg.getBoundingClientRect(),
          issues = [];
        const labels = [...svg.querySelectorAll('text')].filter(
          (n) => n.getBoundingClientRect().width && !n.closest('[opacity="0"], [hidden]'),
        );
        for (let i = 0; i < labels.length; i++) {
          const a = labels[i].getBoundingClientRect();
          if (
            a.left < bounds.left - 1 ||
            a.right > bounds.right + 1 ||
            a.top < bounds.top - 1 ||
            a.bottom > bounds.bottom + 1
          )
            issues.push('bounds: ' + labels[i].textContent.trim());
          for (const m of labels.slice(i + 1)) {
            const b = m.getBoundingClientRect();
            if (
              Math.min(a.right, b.right) - Math.max(a.left, b.left) > 3 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 3
            )
              issues.push(`${labels[i].textContent.trim()} / ${m.textContent.trim()}`);
          }
        }
        return issues;
      });
      if (issues.length) notices.push({ size, id, issues });
      const tall = (await target.boundingBox()).height > height;
      for (const part of tall ? ['top', 'bottom'] : ['']) {
        if (part)
          await target.evaluate((e, p) => {
            e.scrollIntoView({ block: p === 'top' ? 'start' : 'end', behavior: 'instant' });
            if (p === 'top') window.scrollBy({ top: -80, behavior: 'instant' });
          }, part);
        const name = `${id}${part ? '-' + part : ''}.jpg`;
        await page.screenshot({ path: join(dir, name), type: 'jpeg', quality: 84, animations: 'disabled' });
        records.push(`${size}/${name}`);
      }
    };
    const byTitle = (id) => `svg:has(> title[id="${id}-title"])`;
    const indexed = async (n, start, notebook, list, copy = false) => {
      for (const [p, id] of list) {
        await step(copy ? notebook : p - start);
        const selector =
          n <= 2
            ? byTitle(id + (n === 1 ? '-svg' : ''))
            : n === 3 && copy
              ? `[data-notebook-figure="${id}"] svg`
              : n === 3
                ? `[data-diagram-id="${id}"] svg`
                : `[data-figure="${id}"] svg`;
        await snap(`l${n}-${copy ? 'nb' : 'p'}${p}-${id}`, selector);
      }
    };
    await go('unit2-lesson-1');
    const d1 = [
      [74, 'electroscope-parts'],
      [74, 'electroscope-states'],
      [80, 'coulomb-pair'],
      [81, 'coulomb-example'],
      [86, 'three-charges'],
      [82, 'storm-charges'],
      [82, 'lightning-rod'],
    ];
    await indexed(1, 73, 14, d1);
    await indexed(1, 73, 14, d1, true);
    for (const [p, id] of [
      [74, 'scope-lab-svg'],
      [77, 'interaction-svg'],
      [81, 'coulomb-svg'],
    ]) {
      await step(p - 73);
      await snap(`l1-p${p}-${id}`, byTitle(id));
    }
    await step(1);
    for (const kind of ['neutral', 'charged']) {
      await click(`[data-scope-test="${kind}"]`);
      assert.equal(Number(await loc('[data-test-leaf-r]').getAttribute('x2')) > 10, kind === 'charged');
      await snap(`l1-p74-${kind}`, byTitle('scope-lab-svg'));
    }
    await step(4);
    await click('[data-interaction-prepare]');
    for (const rod of ['plastic', 'glass']) {
      await click(`[data-interaction-rod="${rod}"]`);
      await click('[name="interaction-prediction"]');
      await click('[data-interaction-approach]');
      await snap(`l1-p77-${rod}`, byTitle('interaction-svg'));
    }
    await step(0);
    await snap('l1-p73-lightning', 'img[src$="lightning.jpg"]');
    await step(14);
    for (const p of [73, 75, 77, 78, 79])
      await snap(`l1-nb${p}-source`, `img[src$="${p === 73 ? 'lightning' : `notebook-p${p}`}.jpg"]`);
    for (const [p, id, values] of [
      [75, 'rub', [1, 2, 3, 4]],
      [78, 'contact', [1, 2, 3, 4]],
      [79, 'induction', ['1', '2', '3a', '3b', '3c']],
    ]) {
      await step(p - 73);
      for (const v of values) {
        await click(`[data-${id}-step="${v}"]`);
        if (id === 'contact') {
          assert.equal(await loc('[data-contact-leaf-charges]').getAttribute('opacity'), v === 4 ? '1' : '0');
          assert.equal(
            await loc('[data-contact-wire]')
              .getAttribute('d')
              .then((d) => d.endsWith('510 78')),
            v === 1 || v === 4,
          );
        }
        if (id === 'induction' && v === '3b')
          for (const [key, op] of [
            ['far', '0'],
            ['near', '1'],
            ['finger', '1'],
          ])
            assert.equal(await loc(`[data-induction-${key}]`).getAttribute('opacity'), op);
        await snap(`l1-p${p}-${id}-${v}`, `[data-u2-sim] svg`);
      }
    }
    await step(13);
    for (const [key, value, direction] of [
      ['f12', 6.75, 'left'],
      ['f13', 1, 'right'],
      ['resultant', 5.75, 'left'],
    ]) {
      await loc(`[data-vector-value="${key}"]`).fill(String(value));
      await loc(`[data-vector-direction="${key}"]`).selectOption(direction);
    }
    await click('[data-vector-draw]');
    const form = '[data-u2-practice]:has([data-vector-canvas="student"])';
    await click(`${form} [data-practice-action="check"]`);
    await page.waitForFunction(() => !document.querySelector('[data-u2-practice][aria-busy=true]'));
    await click(`${form} [data-practice-action="solution"]`);
    for (const variant of ['student', 'solution']) {
      const s = `[data-vector-canvas="${variant}"]`;
      const lengths = await page
        .locator(`${s} [data-vector-line]`)
        .evaluateAll((lines) => lines.map((l) => l.x2.baseVal.value - l.x1.baseVal.value));
      assert.deepEqual(lengths, [-108, 16, -92]);
      await snap(`l1-p86-vectors-${variant}`, s);
    }
    await go('unit2-lesson-1-appendix');
    await snap('l1-app-hero', '.u2l1a-hero-art');
    for (const [st, sel] of [
      ['puzzle', '[data-puzzle-svg]'],
      ['charge', '[data-ledger-body="a"] svg'],
      ['forces', '[data-arena-svg]'],
      ['coulomb', '[data-coulomb-svg]'],
      ['summary', '.u2l1a-concept-map'],
    ]) {
      await station(st);
      await snap(`l1-app-${st}`, sel);
      if (st === 'charge') await snap('l1-app-charge-b', '[data-ledger-body="b"] svg');
    }
    await station('forces');
    await click('[data-arena-reveal]');
    await snap('l1-app-forces-attract', '[data-arena-svg]');
    await click('[data-arena-flip]');
    await click('[data-arena-unequal]');
    await snap('l1-app-forces-repel', '[data-arena-svg]');
    await station('methods');
    for (const [method, states] of [
      ['friction', ['rub', 'test']],
      ['contact', ['touch', 'separate']],
      ['induction', ['approach', 'ground', 'unground', 'withdraw']],
    ]) {
      await click(`[data-method-tab="${method}"]`);
      for (const state of states) {
        await click(`[data-method-steps="${method}"] [data-method-step="${state}"]`);
        const s = `[data-method-svg="${method}"]`;
        assert.equal(
          await loc(`${s} [data-method-flow]`).getAttribute('opacity'),
          ['rub', 'touch', 'ground'].includes(state) ? '1' : '0',
        );
        await snap(`l1-app-${method}-${state}`, s);
      }
    }
    await go('unit2-lesson-2');
    const d2 = [
      [87, 'intro-scenes'],
      [89, 'current-direction'],
      [92, 'series-circuit'],
      [90, 'qt-graph'],
      [93, 'batteries-series'],
      [93, 'parallel-circuit'],
      [94, 'batteries-parallel'],
    ];
    await indexed(2, 87, 10, d2);
    await indexed(2, 87, 10, d2, true);
    for (const [p, id] of [
      [88, 'tl'],
      [90, 'p90-graph'],
      [91, 'cl'],
    ]) {
      await step(p - 87);
      await snap(`l2-p${p}-${id}`, byTitle(id));
    }
    await step(3);
    for (const t of [5, 10, 15, 20, 25])
      await page.locator(`[data-graph-point="${t},${4 * t}"] .u2l2-graph-hit`).dispatchEvent('click');
    await click('[data-u2l2-practice="p90-graph"] [data-practice-action="check"]');
    await page.waitForFunction(() => !document.querySelector('[data-u2l2-practice="p90-graph"][aria-busy]'));
    assert.equal(await page.locator('.u2l2-graph-point.is-correct').count(), 5);
    await snap('l2-p90-placed', byTitle('p90-graph'));
    await step(6);
    for (const mode of ['series', 'parallel']) {
      await click(`[data-circuit-mode="${mode}"]`);
      for (const removed of [false, true]) {
        if (removed) await click('[data-circuit-remove]');
        const s = `[data-circuit-canvas="${mode}"]`;
        assert.equal(await shown(`${s} [data-lamp="2"]`), !removed);
        const meters = await page.locator(`${s} [data-${mode}-a1], ${s} [data-${mode}-a2]`).allTextContents();
        assert.deepEqual(
          meters,
          mode === 'series'
            ? removed
              ? ['0 mA', '0 mA']
              : ['200 mA', '200 mA']
            : removed
              ? ['200 mA', '0 mA']
              : ['200 mA', '100 mA'],
        );
        assert.equal(
          await text('[data-circuit-src]'),
          (mode === 'series' ? (removed ? 0 : 200) : removed ? 200 : 300) + ' mA',
        );
        await snap(`l2-p93-${mode}-${removed ? 'removed' : 'closed'}`, byTitle('cc'));
      }
    }
    await step(8);
    await snap('l2-p95-curve-b', '.u2l2-curve-option:has(svg[aria-label="منحنى b"])');
    await go('unit2-lesson-2-appendix');
    await snap('l2-app-hero', '.u2l2a-hero-art svg');
    for (const s of ['origin', 'electrons', 'direction']) {
      await station(s);
      if (s === 'origin') await click('[data-origin-switch]');
      if (s === 'electrons') await click('[data-drift-circuit]');
      if (s === 'direction') {
        assert.equal(await shown('[data-layer="electrons"]'), false);
        await click('[data-direction-toggle="electrons"]');
        assert.equal(await shown('[data-layer="electrons"]'), true);
        assert.equal(await loc('[data-direction-toggle="electrons"]').getAttribute('aria-pressed'), 'true');
      }
      await snap(`l2-app-${s}`, `svg[data-scene="${s}-scene"]`);
    }
    await station('ammeter');
    await click('[data-lab-book]');
    await snap('l2-app-dial', '.u2l2a-dial-svg');
    await station('map');
    await snap('l2-app-map', '[data-map-svg]');
    await go('unit2-lesson-3');
    await snap('l3-hero', '.p3-hero-visual svg');
    const d3 = [
      [97, 'daily-devices'],
      [98, 'water-levels'],
      [98, 'charge-transfer'],
      [99, 'pump-circuit'],
      [99, 'voltmeter-instrument'],
      [100, 'source-circuit'],
      [101, 'series-circuit'],
      [102, 'parallel-circuit'],
      [103, 'transformer'],
    ];
    await indexed(3, 97, 10, d3);
    await indexed(3, 97, 10, d3, true);
    await step(7);
    await snap('l3-p104-map', '.p3-concept-map');
    await step(1);
    assert.equal(await shown('[data-water-flow-arrow]'), false);
    await snap('l3-p98-water-closed', byTitle('p3-water-svg'));
    await click('[data-water-tap="open"]');
    assert.equal(await shown('[data-water-flow-arrow]'), true);
    await snap('l3-p98-water-open', byTitle('p3-water-svg'));
    for (const p of [100, 101, 102]) {
      await step(p - 97);
      for (const state of ['open', 'close']) {
        await click(`[data-lab-toggle="${state}"]`);
        assert.equal(await shown('[data-lab-flow]'), state === 'close');
        const volts = (key) => text(`[data-lab-reading="${key}"]`).then(parseFloat);
        if (p === 100) {
          assert.ok((await volts('source')) > 0);
          assert.equal((await volts('current')) > 0, state === 'close');
          assert.equal(await volts('lamp'), state === 'close' ? await volts('source') : 0);
        } else {
          const [u, a, b] = await Promise.all(['u', 'u1', 'u2'].map(volts));
          assert.ok(u > 0);
          if (state === 'open') assert.deepEqual([a, b], [0, 0]);
          else if (p === 101) assert.ok(Math.abs(a + b - u) < 0.01);
          else assert.deepEqual([a, b], [u, u]);
        }
        await snap(`l3-p${p}-lab-${state}`, '.p3p-lab-svg');
      }
    }
    await go('unit2-lesson-3-appendix');
    await snap('l3-app-hero', '.u2l3a-hero-art svg');
    for (const s of ['meaning', 'probes', 'potentials', 'sum', 'detective', 'dipoles']) {
      await station(s);
      if (s === 'meaning') {
        await click('[data-meaning-measure]');
        await snap('l3-app-single-closed', '[data-scene="meaning"]');
        await click('[data-meaning-switch]');
        await snap('l3-app-single-open', '[data-scene="meaning"]');
      }
      if (s === 'probes') {
        await snap('l3-app-probes', '[data-scene="probes"]');
        await click('[data-probes-fault]');
        assert.equal(await page.locator('[data-scene="probes"] .is-lit').count(), 0);
        assert.equal(await text('[data-dmm="probes"] [data-dmm-value]'), '6');
        await snap('l3-app-probes-fault', '[data-scene="probes"]');
        await click('[data-probes-fault]');
        await loc('[data-probe-select="red"]').selectOption('neg');
        await loc('[data-probe-select="black"]').selectOption('pos');
        assert.equal(parseFloat((await text('[data-dmm="probes"] [data-dmm-value]')).replace('−', '-')), -6);
        await snap('l3-app-probes-reversed', '[data-scene="probes"]');
      }
      if (s === 'potentials') {
        await loc('[data-pot-reference]').selectOption('mid');
        await snap('l3-app-potentials', '[data-scene="potentials"]');
        await snap('l3-app-pot-bars', '[data-pot-bars]');
        await snap('l3-app-probe-v3', '[data-scene="q-v3"]');
      }
      if (s === 'sum')
        for (const layout of ['series2', 'series3', 'parallel2']) {
          await click(`[data-sum-layout="${layout}"]`);
          assert.equal(
            await page.locator('[data-scene="sum"] .u2l3a-lamp-body').count(),
            layout === 'series3' ? 3 : 2,
          );
          await snap(`l3-app-sum-${layout}`, '[data-scene="sum"]');
        }
      if (s === 'detective') await snap('l3-app-probe-dt1', '[data-scene="q-dt1"]');
      if (s === 'dipoles')
        for (const k of ['source', 'lamp']) {
          await click(`[data-dipole="${k}"]`);
          await click('[data-dipole-trial-a]');
          await snap(`l3-app-dipole-${k}`, '[data-dipole-symbol] svg');
        }
    }
    await station('map');
    await snap('l3-app-map', '.u2l3a-map-svg');
    await go('unit2-lesson-4');
    await snap('l4-hero', '.r4-hero-visual svg');
    const d4 = [
      [107, 'devices'],
      [111, 'wire-compare'],
      [112, 'rho-wire'],
      [116, 'resistor-bands'],
      [117, 'rheostat'],
      [118, 'summary-map'],
      [108, 'lamp-circuit'],
      [109, 'ohm-setup'],
      [110, 'ohm-slope-graph'],
      [113, 'series-circuit'],
      [114, 'parallel-circuit'],
      [115, 'equivalent-summary'],
      [117, 'led'],
      [119, 'self-check-graph'],
    ];
    await indexed(4, 107, 14, d4);
    await indexed(4, 107, 14, d4, true);
    for (const [p, id, sel] of [
      [108, 'heat', '[data-heat-lamp]'],
      [109, 'ohm', '[data-ohm-graph] svg'],
      [112, 'wire', '[data-u2l4-sim="wire"] .r4-lab-stage'],
      [117, 'rheostat', '[data-u2l4-sim="rheostat"] .r4-lab-stage'],
    ]) {
      await step(p - 107);
      await snap(`l4-p${p}-lab-${id}`, sel);
    }
    await step(9);
    await snap('l4-p116-colour-key', 'table:has(.r4-colour-dot)');
    await step(14);
    await snap('l4-nb116-colour-key', 'table:has(.r4-colour-dot)');
    for (const p of [113, 114]) {
      await step(p - 107);
      for (const state of ['open', 'close']) {
        await click(`[data-lab-toggle="${state}"]`);
        if (p === 114 && state === 'close')
          assert.equal(
            parseFloat(await text('[data-lab-reading="u"]')),
            Number(await loc('[data-lab-source]').inputValue()),
          );
        await snap(`l4-p${p}-lab-${state}`, '.r4p-svg');
      }
    }
    await step(8);
    for (const mode of ['series', 'parallel']) {
      await click(`[name="r4-network-mode"][value="${mode}"]`);
      for (const state of ['open', 'close']) {
        await click(`[data-network-switch="${state}"]`);
        assert.equal(parseFloat(await text('[data-network-i]')), state === 'open' ? 0 : mode === 'series' ? 2 : 8);
        await snap(`l4-p115-mini-${mode}-${state}`, '.r4-mini-circuit');
      }
    }
    await step(9);
    await snap('l4-p116-colour', '.r4-band-preview');
    for (const [route, items] of [
      [
        'unit2-lesson-1-test',
        [
          [4, 'repel'],
          [14, 'attract'],
        ],
      ],
      [
        'unit2-lesson-2-test',
        [
          [4, 'directions'],
          [14, 'qt'],
        ],
      ],
      [
        'unit2-lesson-3-test',
        [
          [11, 'parallel'],
          [16, 'series'],
        ],
      ],
      [
        'unit-2-test',
        [
          [22, 'qt'],
          [41, 'ui'],
        ],
      ],
    ]) {
      const rendered = [];
      await go(route);
      await click('[data-action="start"]');
      for (const [n, id] of items) {
        await click(`[data-action="go-question"][data-index="${n - 1}"]`);
        const s = id === 'ui' ? '.r4-graph-svg' : '.assessment-figure svg';
        if (id === 'ui')
          assert.notEqual(await loc('.r4-plot-line').evaluate((e) => getComputedStyle(e).stroke), 'none');
        rendered.push([n, id, await loc(s).getAttribute('aria-labelledby')]);
        await snap(`${route}-q${n}-${id}`, s);
      }
      await click('[data-action="attempt-submit"]');
      await click('[data-dialog-action="confirm-submit"]');
      for (const [n, id, title] of rendered)
        await snap(`${route}-solution-q${n}-${id}`, `.solution-item svg[aria-labelledby="${title}"]`);
    }
    await go('unit2-exercises');
    for (const id of ['charge', 'circuit']) await snap(`ex-p122-${id}`, byTitle(id));
    await go('appendices');
    for (const id of ['charges', 'current', 'voltage']) await snap(`library-${id}`, `.appendix-card-art-${id}`);
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log(`Chromium ${browser.version()}, ${records.length} screenshots`);
  console.log('Label-box review flags (inspect font ink as well as bounds):', JSON.stringify(notices));
  if (!process.env.QA_MATCH) await writeFile(join(out, 'screenshots.txt'), records.join('\n') + '\n');
} finally {
  await browser.close();
}
