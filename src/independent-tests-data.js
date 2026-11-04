/* ============================================================================
   Independent Tests («اختبارات مستقلة») — content registry and pure logic.
   ----------------------------------------------------------------------------
   Stage 1 ships the structure only: both registries below are intentionally
   EMPTY and no placeholder or sample content is ever rendered from them.
   Later tasks append real entries here.

   Entry contract for INDEPENDENT_TESTS (one object per independent test):
     {
       id: 'test-01',        // REQUIRED, stable, unique — links test ↔ solution
       number: 1,            // display number of the test
       title: '…',           // test name
       subject: '…',         // optional topic line (unit / lesson reference)
       source: '…',          // optional provenance note (e.g. textbook pages)
       questionCount: 0,     // filled in when questions are transcribed
     }

   INDEPENDENT_TEST_SOLUTIONS maps the SAME stable test id to its worked
   solution: { 'test-01': { testId: 'test-01', title: '…', body: '…' } }.
   The linkage is by `id` only — never by display order, card position, or
   title text.
   ========================================================================== */

export const INDEPENDENT_TESTS = Object.freeze([]);

/** Worked solutions keyed by the stable test id. Empty in stage 1. */
export const INDEPENDENT_TEST_SOLUTIONS = Object.freeze({});

const REQUIRED_TEST_FIELDS = ['id', 'number', 'title'];

/**
 * Validate one test entry against the registry contract.
 * Throws TypeError with a precise message on any violation; returns the entry.
 */
export function validateTestEntry(entry) {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new TypeError('test entry must be a plain object');
  }
  for (const field of REQUIRED_TEST_FIELDS) {
    if (entry[field] === undefined || entry[field] === null || entry[field] === '') {
      throw new TypeError(`test entry is missing required field "${field}"`);
    }
  }
  if (typeof entry.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/i.test(entry.id)) {
    throw new TypeError(`test id "${entry.id}" must be a stable slug (letters, digits, dashes)`);
  }
  if (!Number.isInteger(entry.number) || entry.number < 1) {
    throw new TypeError(`test "${entry.id}" needs a positive integer display number`);
  }
  if (typeof entry.title !== 'string' || !entry.title.trim()) {
    throw new TypeError(`test "${entry.id}" needs a non-empty title`);
  }
  return entry;
}

/** Look up a test by its stable id. Returns undefined for unknown ids. */
export function getTestById(testId) {
  return INDEPENDENT_TESTS.find((test) => test.id === testId);
}

/** Look up the worked solution bound to a test id. Returns undefined if none. */
export function getSolutionForTest(testId) {
  const solution = INDEPENDENT_TEST_SOLUTIONS[testId];
  return solution === undefined ? undefined : solution;
}

/** True when a worked solution is registered for the given test id. */
export function hasSolutionForTest(testId) {
  return Object.prototype.hasOwnProperty.call(INDEPENDENT_TEST_SOLUTIONS, testId);
}

/**
 * Ids of tests that currently have no registered solution — used by the
 * solutions tab to stay consistent with the tests tab. Order-independent:
 * everything is derived from the stable ids, never from array positions.
 */
export function testIdsWithoutSolution() {
  return INDEPENDENT_TESTS.map((test) => test.id).filter((id) => !hasSolutionForTest(id));
}
