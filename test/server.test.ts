import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { range, linspace } from '../src/server.js';

test('range(0, 5)', () => {
  assert.deepEqual(range(0, 5), [0, 1, 2, 3, 4]);
});

test('range(5) is range(0, 5)', () => {
  assert.deepEqual(range(5), [0, 1, 2, 3, 4]);
});

test('range with step', () => {
  assert.deepEqual(range(0, 10, 2), [0, 2, 4, 6, 8]);
});

test('range with negative step', () => {
  assert.deepEqual(range(5, 0, -1), [5, 4, 3, 2, 1]);
});

test('range empty when bounds inverted', () => {
  assert.deepEqual(range(5, 0), []);
});

test('rejects step=0', () => {
  assert.throws(() => range(0, 5, 0));
});

test('linspace returns evenly-spaced floats', () => {
  assert.deepEqual(linspace(0, 1, 5), [0, 0.25, 0.5, 0.75, 1]);
});

test('linspace num=1', () => {
  assert.deepEqual(linspace(0, 10, 1), [0]);
});

test('linspace num=0', () => {
  assert.deepEqual(linspace(0, 10, 0), []);
});
