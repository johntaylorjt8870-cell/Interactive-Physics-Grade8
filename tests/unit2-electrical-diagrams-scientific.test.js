import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { UNIT2_DIAGRAMS as electrostatics } from '../src/unit2-lesson1-diagrams.js';
import { unit2AssessmentDiagram as chargeTest } from '../src/unit2-lesson1-test-diagrams.js';
import { methodState } from '../src/unit2-lesson1-appendix-physics.js';
import { UNIT2L2_DIAGRAMS as current } from '../src/unit2-lesson2-diagrams.js';
import { unit2l2AssessmentDiagram as currentTest } from '../src/unit2-lesson2-test-diagrams.js';
import { unit2l2SimulationMarkup as currentLab } from '../src/unit2-lesson2-simulation.js';
import { unit2l3DiagramMarkup as voltage } from '../src/unit2-lesson3-diagrams.js';
import { unit2l3PracticeMarkup as voltageLab } from '../src/unit2-lesson3-practice.js';
import { unit2l3AssessmentDiagram as voltageTest } from '../src/unit2-lesson3-test-diagrams.js';
import { unit2l4DiagramMarkup as resistance } from '../src/unit2-lesson4-diagrams.js';
import { unit2l4PracticeMarkup as resistanceLab } from '../src/unit2-lesson4-practice.js';
import { unit2AssessmentDiagram as unitTest } from '../src/unit-2-test-diagrams.js';

import { benchSceneMarkup } from '../src/unit2-lesson3-appendix.js';
import { createCircuit } from '../src/unit2-lesson3-appendix-physics.js';
import { circuitMarkup } from '../src/unit2-lesson4-simulations.js';
import { UNIT2L2_PAGES } from '../src/unit2-lesson2-content.js';
import { UNIT2L2_NOTEBOOK_BLOCK as notebook } from '../src/unit2-lesson2-notebook.js';
import { ORIGIN_SCENE_NOTE } from '../src/unit2-lesson2-appendix-content.js';
import { unit2l2Answer } from '../src/unit2-lesson2-answers.js';
import * as dcPhysics from '../src/unit2-lesson2-physics.js';
import { unit2l2PracticeMarkup } from '../src/unit2-lesson2-practice.js';

const file = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const attr = (s, k) => s.match(new RegExp(`\\s${k}="([^"]*)"`))?.[1];
const tags = (s, name) => [...s.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => m[0]);
const cls = (s, c) => (attr(s, 'class') || '').split(' ').includes(c);
const num = (s, ...attrs) => attrs.map((a) => Number(attr(s, a)));
const nums = (s) => s.match(/-?\d+(?:\.\d+)?/g).map(Number);
const eq = (a, b) => String(a) === String(b);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);

// Interpret the straight segments that actually paint copper. A fresh M is a lift
// of the pen, NOT a connection. Do not use data-terminals or the DOM ordering
// as an electrical netlist. These circuits have no unmarked crossing junctions.
function lines(d) {
  const tokens = d.match(/[a-z]|-?\d*\.?\d+/gi),
    segments = [];
  let p = [0, 0],
    start,
    cmd,
    k = 0;
  while (k < tokens.length) {
    if (/^[a-z]$/i.test(tokens[k])) cmd = tokens[k++];
    const op = cmd.toUpperCase(),
      relative = op !== cmd;
    const read = (axis) => Number(tokens[k++]) + (relative ? p[axis] : 0);
    let q;
    if (op === 'H') q = [read(0), p[1]];
    else if (op === 'V') q = [p[0], read(1)];
    else if (op === 'L' || op === 'M') q = [read(0), read(1)];
    else if (op === 'Z') q = start;
    else assert.fail(`Non-wire command ${cmd} in ${d}`);
    if (op === 'M') {
      start = q;
      cmd = relative ? 'l' : 'L';
    } else segments.push([p, q]);
    p = q;
  }
  return segments;
}
const on = ([x, y], [[a, b], [c, d]]) =>
  (x - a) * (d - b) === (y - b) * (c - a) && (x - a) * (x - c) <= 0 && (y - b) * (y - d) <= 0;
const paths = (svg, pred) =>
  tags(svg, 'path')
    .filter(pred)
    .flatMap((t) => lines(attr(t, 'd')));
function nets(segs, groups) {
  const connected = (p, q) => {
    const seen = new Set(),
      queue = segs.filter((s) => on(p, s));
    while (queue.length) {
      const s = queue.pop();
      if (seen.has(s)) continue;
      seen.add(s);
      if (on(q, s)) return true;
      for (const t of segs) if (!seen.has(t) && (s.some((v) => on(v, t)) || t.some((v) => on(v, s)))) queue.push(t);
    }
    return false;
  };
  groups.forEach((g, i) =>
    g.forEach((p) => {
      assert.ok(
        segs.some((s) => on(p, s)),
        `floating terminal ${p}`,
      );
      assert.ok(connected(g[0], p), `missing link ${g[0]} → ${p}`);
      groups.slice(i + 1).forEach((h) => assert.ok(!connected(p, h[0]), `bare short ${p} → ${h[0]}`));
    }),
  );
}
const copper = (svg, ...classes) => paths(svg, (p) => classes.some((c) => cls(p, c)));
const points = (svg, c) =>
  tags(svg, 'circle')
    .filter((t) => cls(t, c))
    .map((t) => num(t, 'cx', 'cy'));
const plateCheck = (svg, prefix) => {
  const [long] = copper(svg, `${prefix}-long`),
    [short] = copper(svg, `${prefix}-short`);
  const length = ([a, b]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  assert.ok(length(long) > length(short), 'positive plate must be longer');
  const sign = (s) => num(svg.match(new RegExp(`<text[^>]*>${s}<`))[0], 'x', 'y');
  const dist = (p, [a, b]) => Math.hypot(p[0] - (a[0] + b[0]) / 2, p[1] - (a[1] + b[1]) / 2);
  assert.ok(dist(sign('\\+'), long) < dist(sign('\\+'), short));
  assert.ok(dist(sign('−'), short) < dist(sign('−'), long));
};

test('E01 · p82 discharges link unlike cloud regions or earth; roof strike lands on grounded conductor', () => {
  const cloud = electrostatics['storm-charges'].svg;
  const bolts = paths(cloud, (p) => cls(p, 'u2-lightning-bolt'));
  const positive = [...cloud.matchAll(/u2-charge-positive"><circle cx="(\d+)" cy="(\d+)"/g)].map((m) =>
    m.slice(1).map(Number),
  );
  const negative = [...cloud.matchAll(/u2-charge-negative"><circle cx="(\d+)" cy="(\d+)"/g)].map((m) =>
    m.slice(1).map(Number),
  );
  assert.ok(negative.some((p) => eq(p, bolts[0][0])) && positive.some((p) => eq(p, bolts[2][1])));
  assert.ok(bolts[3][0][1] < 220 && bolts.at(-1)[1][1] >= 342, 'cloud to ground, not another in-cloud bolt');
  const rod = electrostatics['lightning-rod'].svg;
  const conductor = tags(rod, 'line').find((p) => cls(p, 'u2-copper'));
  assert.deepEqual(paths(rod, (p) => cls(p, 'u2-lightning-bolt')).at(-1)[1], num(conductor, 'x2', 'y2'));
  const lead = attr(
    tags(rod, 'path').find((p) => cls(p, 'u2-copper')),
    'd',
  );
  assert.deepEqual(nums(lead).slice(0, 2), num(conductor, 'x1', 'y1'));
  assert.ok(tags(rod, 'line').some((p) => cls(p, 'u2-ground-rod') && Number(attr(p, 'y2')) > 396));
});
test('E02 · p79 grounding removes far-side excess before withdrawing the rod, conserves electrons', () => {
  const approach = methodState('induction', 'approach');
  assert.equal(approach.b.polarized.farEnd, 'negative');
  for (const id of ['ground', 'unground']) {
    const s = methodState('induction', id);
    assert.equal(s.b.polarized.nearEnd, 'positive');
    assert.equal(s.b.polarized.farEnd, 'neutral');
    assert.ok(s.b.electronDelta < 0);
    assert.equal(s.ground, -s.b.electronDelta);
  }
  assert.equal(methodState('induction', 'withdraw').b.polarized, null);
});
test('E03 · p80 assessment force pairs have equal opposite vectors reaching away/toward on the joining line', () => {
  for (const diagram of ['repel', 'attract']) {
    const svg = chargeTest({ diagram });
    const f = tags(svg, 'line')
      .filter((p) => attr(p, 'marker-end'))
      .map((p) => num(p, 'x1', 'y1', 'x2', 'y2'));
    assert.equal(f.length, 2);
    assert.equal(f[0][1], f[1][1]);
    f.forEach((a, i) => {
      assert.equal(a[1], a[3]);
      assert.equal(Math.sign(a[2] - a[0]), (diagram === 'repel' ? -1 : 1) * (i === 0 ? 1 : -1));
    });
    assert.equal(f[0][2] - f[0][0], f[1][0] - f[1][2]);
  }
});
test('E04 · p87 two lamps, source and switch really in one loop; lever closes both contacts', () => {
  const svg = current['intro-scenes'].svg;
  nets(copper(svg, 'u2-wire'), [
    [
      [460, 145],
      [520, 112],
    ], // holder (two visible cells) to switch
    [
      [580, 112],
      [636, 205],
    ],
    [
      [604, 205],
      [554, 205],
    ], // the wire BETWEEN the two lamps, as photographed
    [
      [522, 205],
      [460, 173],
    ],
  ]);
  const lever = tags(svg, 'line').find((p) => cls(p, 'u2l2-switch-lever'));
  assert.deepEqual([num(lever, 'x1', 'y1'), num(lever, 'x2', 'y2')], points(svg, 'u2l2-switch-contact'));
});
test('E05 · q(t) measured points are distinguished from the origin and match assessment ticks and slopes', () => {
  const svg = current['qt-graph'].svg;
  const dots = points(svg, 'u2-plot');
  assert.equal(dots.length, 5);
  assert.equal(tags(svg, 'polyline').length, 0, 'no pre-drawn construction on the printed p90 grid');
  for (const [i, [x, y]] of dots.entries()) {
    const t = (x - 80) / 16,
      q = (300 - y) / 2;
    assert.equal(t, (i + 1) * 5);
    near(q / t, 4);
  }
  const test = currentTest({ diagram: 'qt' });
  for (const t of tags(test, 'circle')) {
    const [x, y] = num(t, 'cx', 'cy');
    const ticks = [...test.matchAll(/<text x="(\d+)" y="(\d+)">(\d+)<\/text>/g)];
    const tx = ticks.find((m) => Number(m[1]) === x),
      qy = ticks.find((m) => Number(m[2]) === y + 5);
    near(Number(qy[3]) / Number(tx[3]), 4);
  }
  const u = unitTest({ diagram: 'charge-time' });
  assert.match(u, /d="M60 235L460 35"/);
  assert.match(u, /x="460" y="255">4/);
  assert.match(u, /x="28" y="40">12/); // 3 C/s, not 4 A from the lesson
});
test('E06 · p93 digital boards break the conductor at the removable bulb and both sides of the meters', () => {
  const boards = currentLab('circuit-lab').split('data-circuit-canvas="');
  nets(copper(boards[1], 'u2-wire'), [
    [
      [105, 146],
      [213, 75],
    ],
    [
      [257, 75],
      [478, 75],
    ],
    [
      [526, 75],
      [524, 246],
    ],
    [
      [480, 246],
      [259, 246],
    ],
    [
      [211, 246],
      [105, 177],
    ],
  ]);
  const svg = boards[2],
    segs = copper(svg, 'u2-wire');
  for (const t of tags(svg, 'circle').filter((t) => cls(t, 'u2-ammeter') || cls(t, 'u2l2-lamp'))) {
    const [x, y, r] = num(t, 'cx', 'cy', 'r');
    const vertical = cls(t, 'u2-ammeter') && y < Math.min(...points(svg, 'u2l2-junction').map((p) => p[1]));
    const dx = vertical ? 0 : r,
      dy = vertical ? r : 0;
    nets(segs, [[[x - dx, y - dy]], [[x + dx, y + dy]]]);
    assert.ok(!segs.some((s) => on([x, y], s)), 'no wire through glass or meter');
  }
});
const bank = (svg, cl) => copper(svg, cl, 'p3-battery-wire');
test('E07 · pp99–101 physical generator plates actually reach both leads and V measures the correct two nets', () => {
  for (const [id, portGroups] of [
    [
      'pump-circuit',
      [
        [
          [550, 284],
          [546, 335],
          [712, 179],
        ],
        [
          [578, 284],
          [582, 335],
          [712, 234],
        ],
      ],
    ],
    [
      'source-circuit',
      [
        [
          [370, 340],
          [350, 420],
          [150, 242],
          [70, 240],
        ],
        [
          [390, 340],
          [390, 420],
          [620, 240],
        ],
        [
          [338, 110],
          [150, 198],
          [70, 200],
        ],
        [
          [382, 110],
          [620, 200],
        ],
      ],
    ],
    [
      'series-circuit',
      [
        [
          [375, 350],
          [360, 420],
          [221, 110],
          [225, 50],
        ],
        [
          [390, 350],
          [400, 420],
          [630, 245],
        ],
        [
          [269, 110],
          [265, 50],
          [391, 110],
          [395, 50],
        ],
        [
          [439, 110],
          [435, 50],
          [630, 205],
        ],
      ],
    ],
  ]) {
    const svg = voltage(id);
    nets(bank(svg, 'p3-wire'), portGroups);
    plateCheck(svg, 'p3-battery');
  }
});
test('E08 · p102 common switch disconnects BOTH lamp branches, never connects the rails by itself', () => {
  const svg = voltage('parallel-circuit'),
    w = bank(svg, 'p3-wire');
  const plus = [
      [130, 220],
      [70, 210],
      [180, 120],
    ],
    loads = [
      [220, 120],
      [230, 200],
      [300, 198],
      [470, 198],
      [540, 200],
    ],
    minus = [
      [130, 240],
      [70, 250],
      [300, 242],
      [470, 242],
      [230, 240],
      [540, 240],
    ];
  nets(w, [plus, loads, minus]);
  nets([...w, ...copper(svg, 'p3-switch-closed')], [[...plus, ...loads], minus]);
  plateCheck(svg, 'p3-battery');
});
test('E09 · parallel/series assessment sources are connected to the 9 V and 24 V measuring loops', () => {
  const p = voltageTest({ diagram: 'parallel-readings' }),
    s = voltageTest({ diagram: 'series-three-drops' });
  const wires = (svg) => paths(svg, (t) => attr(t, 'data-wire') !== undefined);
  const glyph = (svg) => svg.match(/<g data-part="generator"[^>]*>([\s\S]*?)<\/g>/)[1];
  const ps = paths(glyph(p), () => true);
  assert.ok(on([90, 103], ps[0]) && on([90, 163], ps[1]));
  assert.ok(ps[0][1][0] - ps[0][0][0] > ps[1][1][0] - ps[1][0][0]);
  nets(wires(p), [
    [
      [90, 103],
      [270, 112],
      [430, 112],
      [510, 115],
    ],
    [
      [90, 163],
      [270, 154],
      [430, 154],
      [510, 151],
    ],
  ]);
  nets(
    [...wires(s), ...paths(glyph(s), (t) => attr(t, 'fill') === 'none')],
    [
      [
        [320, 220],
        [160, 70],
      ],
      [
        [338, 220],
        [480, 70],
      ],
      [
        [200, 70],
        [300, 70],
      ],
      [
        [340, 70],
        [440, 70],
      ],
    ],
  );
});
test('E10 · p103 windings: AC leads land on coils, primary has twice the secondary turns', () => {
  const svg = voltage('transformer');
  const lengths = ['primary', 'secondary'].map((k) => {
    const d = attr(
      tags(svg, 'path').find((t) => cls(t, 'p3-coil-' + k)),
      'd',
    );
    const start = nums(d).slice(0, 2),
      end = [...start];
    const turns = [...d.matchAll(/q(-?\d+) (\d+) (-?\d+) (\d+)l(-?\d+) (\d+)/g)];
    turns.forEach((m) => {
      end[0] += Number(m[3]) + Number(m[5]);
      end[1] += Number(m[4]) + Number(m[6]);
    });
    const leads = copper(svg, 'p3-ac-line');
    for (const p of [start, end]) assert.ok(leads.some((s) => on(p, s)));
    return turns.length;
  });
  near(lengths[0] / lengths[1], 220 / 110);
});
test('E11 · pp109/113/114 V taps span the specimen or pair; main and branch A have no parallel bypass', () => {
  const rows = [
    [
      'ohm-setup',
      [
        [
          [110, 185],
          [296, 90],
        ],
        [
          [344, 90],
          [402, 90],
          [426, 180],
        ],
        [
          [474, 180],
          [498, 90],
          [530, 150],
        ],
        [
          [530, 202],
          [110, 203],
        ],
      ],
    ],
    [
      'series-circuit',
      [
        [
          [90, 205],
          [182, 110],
          [316, 214],
        ],
        [
          [278, 110],
          [316, 110],
        ],
        [
          [364, 110],
          [402, 110],
        ],
        [
          [498, 110],
          [364, 214],
          [620, 150],
        ],
        [
          [620, 202],
          [90, 223],
        ],
      ],
    ],
    [
      'parallel-circuit',
      [
        [
          [96, 270],
          [226, 80],
          [226, 270],
          [326, 170],
        ],
        [
          [274, 80],
          [372, 80],
        ],
        [
          [274, 270],
          [372, 270],
        ],
        [
          [468, 80],
          [468, 270],
          [374, 170],
          [374, 370],
        ],
        [
          [326, 370],
          [96, 288],
        ],
      ],
    ],
  ];
  for (const [id, g] of rows) {
    const svg = resistance(id);
    nets(copper(svg, 'r4-wire'), g);
    plateCheck(svg, 'r4-battery');
  }
});
test('E12 · pp113/114 independent lab artwork: V spans the pair; open switch cuts the common lead', () => {
  const s = resistanceLab('p113-lab'),
    p = resistanceLab('p114-lab');
  nets(copper(s, 'r4p-wire'), [
    [
      [80, 184],
      [190, 96],
      [307, 210],
    ],
    [
      [282, 96],
      [307, 96],
    ],
    [
      [353, 96],
      [380, 96],
    ],
    [
      [472, 96],
      [353, 210],
      [560, 120],
    ],
    [
      [560, 168],
      [80, 204],
    ],
  ]);
  nets(copper(p, 'r4p-wire'), [
    [
      [96, 226],
      [96, 198],
    ],
    [
      [96, 150],
      [227, 64],
      [227, 246],
      [323, 150],
    ],
    [
      [273, 64],
      [300, 64],
    ],
    [
      [273, 246],
      [300, 246],
    ],
    [
      [392, 64],
      [392, 246],
      [369, 150],
      [453, 300],
    ],
    [
      [407, 300],
      [96, 246],
    ],
  ]);
  [s, p].forEach((svg) => plateCheck(svg, 'r4p-battery'));
});
test('E13 · pp115/117 no copper bypass across R or LED; optical rays leave the junction', () => {
  const p = resistance('equivalent-summary');
  nets(copper(p, 'r4-wire'), [
    [
      [60, 120],
      [75, 120],
    ],
    [
      [145, 120],
      [200, 120],
    ],
    [
      [270, 120],
      [300, 120],
    ],
    [
      [485, 105],
      [485, 175],
    ],
    [
      [565, 105],
      [565, 175],
    ],
  ]);
  const led = resistance('led');
  nets(copper(led, 'r4-wire'), [
    [
      [70, 200],
      [161, 110],
    ],
    [
      [239, 110],
      [300, 110],
    ],
    [
      [360, 110],
      [70, 218],
    ],
  ]);
  plateCheck(led, 'r4-battery');
  for (const [a, b] of copper(led, 'r4-photon')) {
    assert.ok(a[0] >= 300 && a[0] < 360 && b[1] < a[1] && b[0] > a[0]);
  }
});
test('E14 · pp110/119 graph line, marks and query point: extrapolate 4 Ω but interpolate 5 Ω', () => {
  for (const [id, mI, mU, query, measured] of [
    [
      'ohm-slope-graph',
      4,
      16,
      [4, 16],
      [
        [0.5, 2],
        [1, 4],
        [1.5, 6],
        [2, 8],
        [3, 12],
      ],
    ],
    [
      'self-check-graph',
      10,
      50,
      [6, 30],
      [
        [2, 10],
        [3, 15],
        [5, 25],
        [7, 35],
        [9, 45],
      ],
    ],
  ]) {
    const svg = resistance(id);
    const [[origin, end]] = copper(svg, 'r4-plot-line');
    assert.deepEqual(origin, [64, 252]);
    const toData = ([x, y]) => [((x - 64) * mI) / 492, ((252 - y) * mU) / 222];
    const compare = (p, q) => p.forEach((n, i) => near(n, q[i]));
    compare(toData(end), id === 'ohm-slope-graph' ? query : measured.at(-1));
    compare(toData(points(svg, 'r4-plot-extension')[0]), query);
    const marks = points(svg, 'r4-plot-point');
    assert.equal(marks.length, measured.length);
    marks.forEach((p, i) => compare(toData(p), measured[i]));
  }
});
test('E15 · p122 equal legs at q₃; 8 Ω before both (6 Ω ∥ 3 Ω) branches, 12 V long plate left', () => {
  // The exercise module mounts on import. These are its literal, published inline SVGs.
  const src = file('src/unit2-exercises.js'),
    tri = src.match(/id="charge-desc"[\s\S]*?<\/svg>/)[0],
    circuit = src.match(/id="circuit-desc"[\s\S]*?<\/svg>/)[0];
  const [a, b, c] = tags(tri, 'circle').map((t) => num(t, 'cx', 'cy'));
  assert.equal(a[0], b[0]);
  assert.equal(b[1], c[1]);
  assert.equal(b[1] - a[1], c[0] - b[0]);
  const resistors = tags(circuit, 'path')
    .slice(1, 4)
    .map((t) => lines(attr(t, 'd')))
    .map((ls) => [ls[0][0], ls.at(-1)[1]]);
  const [r1, r2, r3] = resistors;
  const [long, short] = lines(attr(tags(circuit, 'path')[4], 'd'));
  const mid = ([p, q]) => p.map((v, i) => (v + q[i]) / 2);
  assert.ok(long[0][0] < short[0][0] && long[1][1] - long[0][1] > short[1][1] - short[0][1]);
  nets(lines(attr(tags(circuit, 'path')[0], 'd')), [
    [mid(long), r1[0]],
    [r1[1], r2[0], r3[0]],
    [mid(short), r2[1], r3[1]],
  ]);
  for (const v of ['R₁ = 8 Ω', 'R₂ = 6 Ω', 'R₃ = 3 Ω', 'U = 12 V']) assert.ok(circuit.includes(v));
});

test('E16 · p95 options: only d stays constant, b changes sign about its actual time axis', () => {
  const svgs = [...unit2l2PracticeMarkup('p95-q3').matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map((m) => m[0]);
  assert.equal(svgs.length, 4);
  for (const [i, s] of svgs.entries()) {
    const axis = Number(attr(tags(s, 'line')[0], 'y1')),
      d = attr(tags(s, 'path')[0], 'd');
    if (i === 1) {
      const n = nums(d);
      const cubic = (a, b, c, e) => (a + 3 * b + 3 * c + e) / 8;
      assert.ok(cubic(n[1], n[3], n[5], n[7]) < axis);
      assert.ok(cubic(n[7], n[9], n[11], n[13]) > axis);
    }
    if (i === 0) assert.ok(nums(d).at(-1) > nums(d)[1]);
    if (i === 2) assert.ok(lines(d).some(([a, b]) => a[1] !== b[1]));
    if (i === 3) assert.ok(lines(d).every(([a, b]) => a[1] === b[1] && a[1] < axis));
  }
});
test('E17 · voltage bench: every rendered probe sits on its modeled wire net; no short through lamps/switch', () => {
  for (const layout of ['single', 'series2', 'series3', 'parallel2']) {
    const c = createCircuit({ layout, closed: false });
    const svg = benchSceneMarkup(c);
    const wires = paths(svg.match(/<g class="u2l3a-wires">([\s\S]*?)<\/g>/)[1], () => true);
    // Reduce model links through IDEAL WIRE ONLY, compare the partition to the drawing.
    const nodes = new Map(c.nodes.map((n) => [n.id, [n.x, n.y]]));
    let sets = [...nodes.keys()].map((id) => [id]);
    for (const link of c.links.filter((l) => !l.element)) {
      const a = sets.find((g) => g.includes(link.from)),
        b = sets.find((g) => g.includes(link.to));
      if (a !== b) {
        a.push(...b);
        sets = sets.filter((g) => g !== b);
      }
    }
    nets(
      wires,
      sets.map((g) => g.map((id) => nodes.get(id))),
    );
    for (const element of c.elements)
      assert.ok(!wires.some((s) => on([element.x, element.y], s)), `${layout}: wire through ${element.kind}`);
    const plate = tags(svg, 'line')
      .filter((p) => cls(p, 'u2l3a-source-plate'))
      .map((p) => num(p, 'x1', 'y1', 'x2', 'y2'))
      .sort((a, b) => b[3] - b[1] - (a[3] - a[1]));
    assert.ok(plate[0][0] > plate[1][0] && c.nodes.find((n) => n.id === 'pos').x > plate[0][0]);
  }
  const svg = benchSceneMarkup(createCircuit({ layout: 'series2' }), { fault: true });
  const wires = paths(svg.match(/<g class="u2l3a-wires">([\s\S]*?)<\/g>/)[1], () => true);
  nets(wires, [
    [
      [450, 90],
      [530, 90],
    ],
    [
      [570, 90],
      [600, 90],
    ],
  ]);
  assert.doesNotMatch(svg, /class="u2l3a-lamp is-lit"/);
});
test('E18 · p108 comparative panels retain ONE load path, inserting extra R does not leave a bare wire', () => {
  const panels = resistance('lamp-circuit')
    .split(/<g transform="translate\(\d+ 26\)">/)
    .slice(1);
  assert.equal(panels.length, 2);
  for (const [i, p] of panels.entries()) {
    const wires = copper(p, 'r4-wire', 'r4-switch-lever');
    const frame = [
      [
        [60, 135],
        [100, 80],
      ],
      [
        [262, 156],
        [60, 153],
      ],
    ];
    nets(wires, [
      ...frame,
      ...(i
        ? [
            [
              [140, 80],
              [164, 80],
            ],
            [
              [220, 80],
              [262, 108],
            ],
          ]
        : [
            [
              [140, 80],
              [262, 108],
            ],
          ]),
    ]);
    plateCheck(p, 'r4-battery');
  }
});
test('E19 · p115 network miniatures: opening switch removes return; each resistor joins correct nodes', () => {
  for (const mode of ['series', 'parallel'])
    for (const closed of [true, false]) {
      const s = circuitMarkup(mode, closed),
        w = copper(s, 'r4-mini-wire'),
        ret = [[460, 180]],
        minus = [
          [60, 126],
          [420, 180],
        ];
      const groups =
        mode === 'series'
          ? [
              [
                [60, 106],
                [188, 50],
              ],
              [
                [272, 50],
                [348, 50],
              ],
            ]
          : [
              [
                [60, 106],
                [238, 50],
                [238, 115],
              ],
            ];
      ret.push(
        ...(mode === 'series'
          ? [[432, 50]]
          : [
              [322, 50],
              [322, 115],
            ]),
      );
      nets(w, [...groups, ...(closed ? [[...ret, ...minus]] : [ret, minus])]);
    }
});
test('E20 · hero diagrams: high and low straddle load, current follows external wire from long plate', () => {
  const a = file('unit2-lesson-3.html'),
    b = file('unit2-lesson-4.html');
  const [hi] = points(a, 'p3-hero-node-high'),
    [lo] = points(a, 'p3-hero-node-low');
  nets(copper(a, 'p3-hero-circuit'), [
    [hi, [390, 185], [280, 106]],
    [lo, [390, 207], [230, 106]],
  ]);
  const [[from, to]] = copper(a, 'p3-hero-arrow');
  assert.equal(from[0], hi[0]);
  assert.equal(to[0], lo[0]);
  const [[longStart, longEnd], [shortStart, shortEnd]] = copper(b, 'r4-hero-cell');
  assert.ok(longEnd[0] - longStart[0] > shortEnd[0] - shortStart[0]);
  const [[tail, tip]] = copper(b, 'r4-hero-flow');
  nets(copper(b, 'r4-hero-circuit'), [
    [
      [412, longStart[1]],
      [176, 120],
    ],
    [[412, shortStart[1]], [326, 120], tail, tip],
  ]);
  assert.ok(tip[0] > tail[0]);
  const hero = file('unit2-lesson-2-appendix.html').split('role="presentation"')[1].split('</svg>')[0];
  const [cw, el] = tags(hero, 'polygon').map((t) =>
    attr(t, 'points')
      .split(' ')
      .map((p) => p.split(',').map(Number)),
  );
  const leads = lines(attr(tags(hero, 'path')[0], 'd'));
  for (const arrow of [cw, el]) assert.ok(arrow.every(([x]) => leads.some((s) => on([x, 196], s))));
  assert.ok(cw[3][0] > cw[0][0] && el[3][0] < el[0][0]);
});

test('E21 · p89 each pair of polygon tips follows its copper segment, I from + and e⁻ opposite', () => {
  const svg = current['current-direction'].svg;
  const wire = copper(svg, 'u2-wire');
  // The cell cap and negative face in the published drawing, through lamp and switch.
  nets(wire, [
    [
      [302, 110],
      [217, 330],
    ],
    [
      [273, 330],
      [449, 330],
    ],
    [
      [495, 330],
      [410, 110],
    ],
  ]);
  const signX = (s) => Number(attr(svg.match(new RegExp(`<text[^>]*>${s}<`))[0], 'x'));
  assert.ok(signX('\\+') < signX('−'));
  const sense = { 'top-left': [-1, 0], left: [0, 1], bottom: [1, 0], right: [0, -1], 'top-right': [-1, 0] };
  const arrows = tags(svg, 'polygon');
  assert.equal(arrows.length, 10);
  for (const [segment, direction] of Object.entries(sense)) {
    const centres = ['current', 'electron'].map((flow, i) => {
      const arrow = arrows.find((a) => cls(a, `u2l2-arrow-${flow}`) && attr(a, 'data-segment') === segment);
      const pts = attr(arrow, 'points')
        .split(' ')
        .map((p) => p.split(',').map(Number));
      const tail = pts[0].map((n, j) => (n + pts.at(-1)[j]) / 2),
        tip = pts[3];
      tip.forEach((n, j) => near(Math.sign(n - tail[j]), direction[j] * (i ? -1 : 1)));
      return tip.map((n, j) => (n + tail[j]) / 2);
    });
    // These arrows are deliberately offset on either side; the wire bisects them.
    const midpoint = centres[0].map((n, j) => (n + centres[1][j]) / 2);
    assert.ok(
      wire.some(([a, b]) => on(midpoint, [a, b]) && (b[0] - a[0]) * direction[1] === (b[1] - a[1]) * direction[0]),
    );
  }
});

test('E22 · pp93–94 four real cell faces, series polarity and parallel buses; bracket spans bank terminals', () => {
  for (const mode of ['series', 'parallel']) {
    const svg = current[`batteries-${mode}`].svg;
    const w = copper(svg, 'u2-wire');
    const cells = [...svg.matchAll(/<g class="u2l2-cell-symbol"[^>]*>([\s\S]*?)<\/g>/g)].map(([, body]) => {
      const ends = tags(body, 'line').map((line) => {
        const a = num(line, 'x1', 'y1'),
          b = num(line, 'x2', 'y2');
        w.push([a, b]);
        return [a, b];
      });
      const top = ends[0][0],
        bottom = ends[1][1];
      const yOf = (sign) => Number(attr(body.match(new RegExp(`<text[^>]*>${sign}<`))[0], 'y'));
      return yOf('\\+') < yOf('−') ? [top, bottom] : [bottom, top];
    });
    assert.equal(cells.length, 4);
    const bracket = copper(svg, 'u2l2-voltage-bracket');
    // The bracket is a measurement annotation, not copper. A subpath may be
    // drawn toward or away from its rail; only its two contact points matter.
    const ends = bracket.flat().filter((p) => w.some((s) => on(p, s)));
    assert.equal(ends.length, 2);
    ends.sort((a, b) => a[1] - b[1]); // free terminals on the right, + above −
    assert.ok(cells.every(([plus, minus]) => plus[1] < minus[1]));
    assert.ok(ends.every(([x]) => x > Math.max(...cells.map(([p]) => p[0]))));
    if (mode === 'series') {
      nets(w, [
        [cells[3][0], ends[0]],
        ...cells.slice(1).map(([, minus], i) => [cells[i][0], minus]),
        [cells[0][1], ends[1]],
      ]);
    } else {
      nets(w, [...ends.map((end, i) => [end, ...cells.map((c) => c[i])])]);
    }
    assert.match(svg, mode === 'series' ? />6 Volts</ : />1\.5 Volts</);
  }
});

test('E23 · live pp100–102: distinct nets at open contacts, both V taps on the correct side of each lamp/source', () => {
  // Each list is one equipotential through bare wire only. The two pins of an
  // open switch must be in different groups, including on the shared p102 return.
  const boards = [
    [
      'p100-lab',
      [
        [
          [362, 340],
          [349, 446],
          [180, 250],
          [90, 228],
        ],
        [
          [180, 206],
          [134, 228],
          [343, 120],
        ],
        [
          [387, 120],
          [600, 252],
        ],
        [
          [600, 296],
          [380, 340],
          [393, 446],
        ],
      ],
    ],
    [
      'p101-series-lab',
      [
        [
          [352, 380],
          [339, 446],
          [218, 120],
          [218, 64],
        ],
        [
          [262, 120],
          [262, 64],
          [458, 120],
          [458, 64],
        ],
        [
          [502, 120],
          [502, 64],
          [630, 258],
        ],
        [
          [630, 302],
          [370, 380],
          [383, 446],
        ],
      ],
    ],
    [
      'p102-parallel-lab',
      [
        [
          [380, 412],
          [393, 470],
          [402, 268],
          [402, 214],
          [402, 116],
          [402, 72],
        ],
        [
          [358, 268],
          [358, 214],
          [358, 116],
          [358, 72],
          [240, 412],
        ],
        [
          [284, 412],
          [362, 412],
          [349, 470],
        ],
      ],
    ],
  ];
  for (const [id, groups] of boards) {
    const s = voltageLab(id);
    plateCheck(s, 'p3-battery');
    const [pin, other] = points(s, 'p3-contact');
    const w = copper(s, 'p3-wire', 'p3-switch-lever');
    nets(w, groups);
    const merged = groups.filter((g) => g.some((p) => eq(p, pin) || eq(p, other)));
    assert.equal(merged.length, 2);
    nets([...w, [pin, other]], [merged.flat(), ...groups.filter((g) => !merged.includes(g))]);
  }
});

test('E24 · unit Q41: read both scales from printed ticks, recover the three actual (I,U) samples and 3 Ω', () => {
  const s = unitTest({ diagram: 'voltage-current' });
  const ticks = [...s.matchAll(/(<text class="r4-axis-tick"[^>]*>)([\d.]+)<\/text>/g)];
  const x = ticks.filter(([_, t]) => attr(t, 'text-anchor') === 'middle');
  const y = ticks.filter(([_, t]) => attr(t, 'text-anchor') === 'end');
  const [origin, end] = copper(s, 'r4-plot-line')[0];
  const last = points(s, 'r4-plot-point');
  assert.equal(last.length, 3);
  assert.deepEqual(end, last.at(-1));
  const pxPerAmp = (Number(attr(x.at(-1)[1], 'x')) - origin[0]) / Number(x.at(-1)[2]);
  const pxPerVolt = (Number(attr(y[0][1], 'y')) - Number(attr(y.at(-1)[1], 'y'))) / Number(y.at(-1)[2]);
  last.forEach(([cx, cy], n) => {
    const i = (cx - origin[0]) / pxPerAmp,
      u = (origin[1] - cy) / pxPerVolt;
    near(i, n + 1);
    near(u, 3 * (n + 1));
    near(u / i, 3);
  });
});

// DC01…10: independent expectations read from image-1…10 (pp87–96).
// The photos are the oracle; the notebook and both lab boards are consumers.
const dcPage = (n) => UNIT2L2_PAGES.find((p) => p.page === n).blocks;
const book = (n) =>
  dcPage(n)
    .filter((b) => b.type === 'book')
    .map((b) => b.html)
    .join('');
const board = (mode) =>
  currentLab('circuit-lab').split('data-circuit-canvas="')[mode === 'series' ? 1 : 2].split('</svg>')[0];
const signs = (s) =>
  [...s.matchAll(/(<text\b[^>]*>)([+−])<\/text>/g)].map(([, t, glyph]) => ({ glyph, at: num(t, 'x', 'y') }));

test('DC01 · p87 two adjacent horizontal cells in one holder; two loads, no asserted internal wiring', () => {
  const svg = current['intro-scenes'].svg;
  const rows = tags(svg, 'rect')
    .filter((r) => cls(r, 'u2l2-holder-cell'))
    .map((r) => num(r, 'x', 'y', 'width', 'height'));
  assert.equal(rows.length, 2);
  assert.ok(rows.every((r) => r[2] > r[3]) && rows[0][0] === rows[1][0] && rows[0][1] + rows[0][3] < rows[1][1]);
  assert.equal(points(svg, 'u2l2-lamp').length, 2);
  assert.ok(copper(svg, 'u2-wire').every((s) => !rows.some(([x, y, w, h]) => on([x + w / 2, y + h / 2], s))));
  assert.equal(signs(svg).length, 0, 'no guessed individual poles');
  assert.match(ORIGIN_SCENE_NOTE, /برمز واحد/); // independent common-switch experiment, not the holder photograph
});

test('DC02 · p88 both blue conductor arrows point LEFT; the push from one chosen end is a different model', () => {
  const reference = book(88).match(/<span class="source-reference-inline">[\s\S]*?<\/span>/)[0];
  assert.match(reference, /سهمان.*كلاهما.*اليسار/);
  assert.doesNotMatch(reference, /متعاكس/);
  assert.match(book(88), /من أحد طرفي الأنبوب/);
  assert.match(currentLab('tube-lab'), /اخترنا الدفع من اليسار/);
});

test('DC03 · p89 lamp and switch interrupt the BOTTOM run; printed e is outside the cell, not drift inside it', () => {
  const svg = current['current-direction'].svg;
  const [[x, y]] = points(svg, 'u2l2-lamp');
  const contacts = points(svg, 'u2l2-switch-contact');
  const bottom = Math.max(
    ...copper(svg, 'u2-wire')
      .flat()
      .map((p) => p[1]),
  );
  assert.equal(y, bottom);
  assert.ok(contacts.every(([sx, sy]) => y === sy && x < sx));
  assert.match(svg, />e<\/text>/);
  assert.match(notebook, /أسهم زرقاء خارج الحلقة/);
  assert.doesNotMatch(notebook, /من القطب الموجب إلى السالب داخل المولّد/);
  assert.match(currentTest({ diagram: 'directions' }), /سهم أصفر/); // its own question and key
});

test('DC04 · p90 distinguish the five printed dots, five blank cells, learner construction and authored q14', () => {
  const blanks = [...book(90).matchAll(/<tr><th>[\s\S]*?<\/th>((?:<td>.*?<\/td>){5})<\/tr>/g)].map(([, row]) =>
    [...row.matchAll(/<td>(.*?)<\/td>/g)].map((m) => m[1]),
  );
  assert.deepEqual(blanks, [
    ['5', '10', '', '20', ''],
    ['4', '', '4', '', ''],
  ]);
  assert.match(notebook, /خانات النسبة الثلاث الناقصة/);
  const ref = current['qt-graph'].svg;
  assert.match(ref, />q \(c\)</);
  const task = unit2l2PracticeMarkup('p90-graph');
  const construction = tags(task, 'polyline').find((e) => e.includes('data-constructed-line'));
  assert.ok(construction && !attr(construction, 'points'), 'no answer path before the attempt');
  assert.ok(
    dcPhysics.gradeGraphPoints([
      [5, 20],
      [10, 40],
      [15, 60],
      [20, 80],
      [25, 100],
    ]).correct,
  );
  assert.equal(tags(currentTest({ diagram: 'qt' }), 'circle').length, 3, 'q14 is NOT the printed p90 grid');
});

test('DC05 · p91 60 C in 30 s ⇒ 2 A, then 360 C in three MINUTES, not three sampling intervals', () => {
  assert.equal(dcPage(91).filter((b) => b.type === 'diagram').length, 0);
  assert.deepEqual(dcPhysics.p91Readings(60, 30), { current: 2, chargeInThreeMinutes: 360 });
  assert.deepEqual(dcPhysics.p91Readings(60, 20), { current: 3, chargeInThreeMinutes: 540 });
  assert.match(currentLab('current-lab'), /كمية الكهرباء خلال ثلاث دقائق/);
});

test('DC06 · p92 source has long upper plate; current enters A₁ from LEFT and A₂ from RIGHT on both boards', () => {
  for (const svg of [current['series-circuit'].svg, board('series')]) {
    plateCheck(svg, 'u2l2-plate');
    const [[long]] = copper(svg, 'u2l2-plate-long'),
      [[short]] = copper(svg, 'u2l2-plate-short');
    assert.ok(long[1] < short[1]);
    const meters = points(svg, 'u2-ammeter').sort((a, b) => a[1] - b[1]);
    const lamps = points(svg, 'u2l2-lamp');
    assert.equal(meters.length, 2);
    for (const [i, [x, y]] of meters.entries()) {
      const lamp = lamps.find((p) => p[1] === y);
      const side = i === 0 ? 1 : -1; // sign of travel in SVG x
      assert.ok(lamp && (lamp[0] - x) * side > 0, 'meter before lamp');
      const nearest = signs(svg)
        .sort((a, b) => Math.hypot(a.at[0] - x, a.at[1] - y) - Math.hypot(b.at[0] - x, b.at[1] - y))
        .slice(0, 2);
      assert.equal(new Set(nearest.map((s) => s.glyph)).size, 2);
      for (const s of nearest) assert.equal(Math.sign((x - s.at[0]) * side), s.glyph === '+' ? 1 : -1);
    }
    const readings = [...svg.matchAll(/(<text\b[^>]*>)(?:I = )?200 mA<\/text>/g)].map(([, t]) => num(t, 'x', 'y'));
    assert.equal(readings.length, 2);
    for (const [x, y] of meters) assert.ok(readings.some(([rx, ry]) => Math.abs(x - rx) < 30 && Math.abs(y - ry) < 65));
  }
});

test('DC07 · p93 closed switch from the + plate to A BEFORE the split, not across the rails or inside a branch', () => {
  for (const svg of [current['parallel-circuit'].svg, board('parallel')]) {
    plateCheck(svg, 'u2l2-plate');
    const segs = copper(svg, 'u2-wire'),
      contacts = points(svg, 'u2l2-switch-contact').sort((a, b) => a[0] - b[0]);
    assert.equal(contacts.length, 2);
    const lever = tags(svg, 'line').find((e) => cls(e, 'u2l2-switch-lever'));
    assert.deepEqual([num(lever, 'x1', 'y1'), num(lever, 'x2', 'y2')], contacts);
    // Derive plate centres and meter ports from the drawn faces, not their declared netlist.
    const plate = (type) => {
      const [[a, b]] = copper(svg, 'u2l2-plate-' + type);
      return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    };
    const [a, a1, a2] = tags(svg, 'circle')
      .filter((e) => cls(e, 'u2-ammeter'))
      .map((e) => num(e, 'cx', 'cy', 'r'))
      .sort((l, r) => l[1] - r[1]);
    assert.ok(contacts[1][0] < plate('long')[0] && plate('long')[0] < plate('short')[0]);
    assert.ok(contacts.every((p) => p[1] === plate('long')[1] && p[1] < a[1]));
    const [l1, l2] = tags(svg, 'circle')
      .filter((e) => cls(e, 'u2l2-lamp'))
      .map((e) => num(e, 'cx', 'cy', 'r'))
      .sort((l, r) => l[1] - r[1]);
    const port = ([x, y, r], dx, dy) => [x + dx * r, y + dy * r];
    nets(segs, [
      [plate('long'), contacts[1]],
      [contacts[0], port(a, 0, -1)],
      [port(a, 0, 1), port(a1, -1, 0), port(a2, -1, 0)],
      [port(a1, 1, 0), port(l1, -1, 0)],
      [port(a2, 1, 0), port(l2, -1, 0)],
      [port(l1, 1, 0), port(l2, 1, 0), plate('short')],
    ]);
  }
  assert.equal((current['parallel-circuit'].svg.match(/>L₁<\/text>/g) || []).length, 2);
  assert.doesNotMatch(current['parallel-circuit'].svg, /\d+ mA|>I =/);
  assert.match(board('parallel'), />L₂<\/text>/);
});

test('DC08 · pp93–94 both banks show the four PRINTED pairs of signs, only cell numbers are annotations', () => {
  for (const mode of ['series', 'parallel']) {
    const bank = current[`batteries-${mode}`];
    assert.match(bank.platformNote, /علامتا \+ و− مطبوعتان/);
    const byX = new Map();
    for (const {
      at: [x, y],
      glyph,
    } of signs(bank.svg))
      byX.set(x, [...(byX.get(x) || []), [y, glyph]]);
    assert.equal(byX.size, 4);
    for (const pair of byX.values())
      assert.deepEqual(
        pair.sort((a, b) => a[0] - b[0]).map((p) => p[1]),
        ['+', '−'],
      );
    const label = bank.svg.match(/<text[^>]+>[^<]*Volts</)[0];
    assert.ok(num(label, 'x')[0] > Math.max(...byX.keys()), 'voltage is across the free terminals on the right');
  }
});

test('DC09 · p95 sample the four traces relative to THEIR axes, including b endpoints and negative c plateau', () => {
  const chart = (id) => {
    const svg = unit2l2PracticeMarkup('p95-q3').match(
      new RegExp(`<svg[^>]*aria-label="منحنى ${id}"[\\s\\S]*?</svg>`),
    )[0];
    const [h, v] = tags(svg, 'line').filter((e) => cls(e, 'u2-axis'));
    assert.match(svg, />I<\/text>/);
    assert.match(svg, />t<\/text>/);
    return { axis: num(h, 'y1')[0], x0: num(v, 'x1')[0], d: attr(tags(svg, 'path')[0], 'd') };
  };
  const a = chart('a'),
    an = nums(a.d);
  assert.ok(an[1] < an[7] && an[7] < a.axis && a.axis - an[7] < (a.axis - an[1]) / 8);
  assert.ok(
    (an[3] - an[1]) / (an[2] - an[0]) > (an[7] - an[5]) / (an[6] - an[4]),
    'steep fall initially, flatten at the tail',
  );
  const b = chart('b'),
    bn = nums(b.d);
  assert.deepEqual(bn.slice(0, 2), [b.x0, b.axis]);
  assert.equal(bn.at(-1), b.axis);
  assert.deepEqual(
    [0, 6, 12].map((i) => Math.sign(b.axis - (bn[i + 1] + 3 * bn[i + 3] + 3 * bn[i + 5] + bn[i + 7]) / 8)),
    [1, -1, 1],
  );
  const c = chart('c'),
    levels = lines(c.d)
      .filter(([l, r]) => l[1] === r[1])
      .map(([l]) => c.axis - l[1]);
  assert.deepEqual(levels.map(Math.sign), [1, -1, 1]);
  assert.ok(levels[0] > levels[2]);
  const d = chart('d'),
    [[l, r]] = lines(d.d);
  assert.ok(l[0] < d.x0 && d.x0 < r[0] && l[1] === r[1] && l[1] < d.axis);
  assert.equal(unit2l2Answer('p95-q3').correct, 'd');
});

test('DC10 · p96 has text, not another circuit: preserve the given 12 c, 2 min and 5 min', () => {
  assert.equal(dcPage(96).filter((b) => b.type === 'diagram' || b.type === 'simulation').length, 0);
  assert.match(book(96), /12\\,\\mathrm\{c\}/);
  assert.deepEqual(dcPhysics.P96_DATA, { chargeC: 12, timeMin: 2, laterMin: 5 });
  assert.deepEqual(dcPhysics.solveP96Question5(), { seconds: 120, laterSeconds: 300, current: 0.1, charge: 30 });
});
