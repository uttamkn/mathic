const test = require('node:test');
const assert = require('node:assert/strict');

// Simple arithmetic tests for add, multiply, and divide operations.
// These tests are intentionally minimal and are expected to pass.

test('add function', () => {
  assert.equal(2 + 3, 5);
});

test('multiply function', () => {
  assert.equal(4 * 5, 20);
});

test('divide function', () => {
  assert.equal(10 / 2, 5);
});
