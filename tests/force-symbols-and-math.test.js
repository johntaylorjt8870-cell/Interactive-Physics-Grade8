import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DIAGRAMS, FORCE_PALETTE } from '../src/diagrams.js';
import { alignedSteps, calculation } from '../src/math.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const texOf = (html) => [...html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)]
  .map((match) => match[1]);

/* PR #33 audited the Lesson 1 force drawings, but the palette was only half
   wired: `plum` (equilibrant F′) and `slate` (reaction R) had arrowheads but
   no shaft stroke and no label colour. An SVG line defaults to stroke:none, so
   those vectors were drawn as a floating arrowhead with a mismatched symbol. */
test('every force colour has a visible shaft, a matching arrowhead and a label colour', async () => {
  const [css, diagramsSource] = await Promise.all([
    read('../src/styles.css'),
    read('../src/diagrams.js'),
  ]);
  for (const [name, color] of Object.entries(FORCE_PALETTE)) {
    assert.match(css, new RegExp(`\\.force-${name}\\s*\\{[^}]*stroke:\\s*${color}`), `shaft stroke for ${name}`);
    assert.match(css, new RegExp(`\\.sym-${name}\\s*\\{[^}]*color:`), `symbol colour for ${name}`);
    assert.ok(diagramsSource.includes(`${name}: '${color}'`), `marker fill for ${name}`);
  }
  assert.match(css, /\.force-prime\s*\{[^}]*font-size/, 'prime mark on F′ is styled');
});

test('every diagram symbol/shaft class resolves and every arrow marker reference exists', async () => {
  const css = await read('../src/styles.css');
  for (const [key, diagram] of Object.entries(DIAGRAMS)) {
    const { svg } = diagram;
    for (const match of svg.matchAll(/class="force-symbol-group sym-([a-z]+)"/g)) {
      assert.match(css, new RegExp(`\\.sym-${match[1]}\\s*\\{[^}]*color:`), `${key}: missing .sym-${match[1]}`);
    }
    for (const match of svg.matchAll(/class="vector-line force-([a-z]+)"/g)) {
      assert.match(css, new RegExp(`\\.force-${match[1]}\\s*\\{[^}]*stroke:`), `${key}: missing .force-${match[1]}`);
    }
    const ids = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
    for (const match of svg.matchAll(/url\(#([^)]+)\)/g)) {
      assert.ok(ids.has(match[1]), `${key}: unresolved marker #${match[1]}`);
    }
    assert.match(svg, /aria-labelledby="/, `${key}: labelled SVG`);
    assert.match(svg, /<title/, `${key}: SVG title`);
    assert.match(svg, /<desc/, `${key}: SVG description`);
  }
});

/* A trailing `\\` plus a stray `&` cell used to add a blank third row to a
   two-line derivation. Calculations must stay on one horizontal flow. */
test('alignedSteps renders exactly one row per line with no empty trailing row', () => {
  const html = alignedSteps(['F=5\\times20', 'F=100\\,\\mathrm{N}'], 'worked example');
  assert.equal((html.match(/<mtr/g) ?? []).length, 2);
  const [source] = texOf(html);
  assert.ok(source.startsWith('\\begin{aligned}'));
  assert.ok(source.endsWith('\\end{aligned}'));
  assert.equal((source.match(/\\\\/g) ?? []).length, 1, 'one row separator for two rows');
  assert.doesNotMatch(source, /&\\end\{aligned\}|&amp;\\end\{aligned\}/);
  assert.doesNotMatch(html, /linebreak="newline"/);
});

test('calculation() keeps an operation chain on a single line', () => {
  const html = calculation('50/0.5=20/d_{2}\\;\\Rightarrow\\;d_{2}=0.2\\,\\mathrm{m}', 'example');
  assert.equal((html.match(/katex-display/g) ?? []).length, 1);
  assert.equal((html.match(/<mtr/g) ?? []).length, 0, 'no stacked rows');
  assert.doesNotMatch(html, /linebreak="newline"/);
  assert.ok(texOf(html)[0].includes('50/0.5'));
});
