require('ts-node/register');
const test = require('node:test');
const assert = require('node:assert/strict');

// Import the utility function from TypeScript source
const { cn } = require('../lib/utils.ts');

// The cn function merges class names using clsx + tailwind-merge.
// These are deterministic operations – perfect for always-passing tests.

test('cn merges simple class names', () => {
  assert.equal(cn('foo', 'bar'), 'foo bar');
});

test('cn deduplicates duplicate classes', () => {
  assert.equal(cn('text-sm', 'text-sm'), 'text-sm');
});
