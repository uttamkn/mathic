require('ts-node/register');
const test = require('node:test');
const assert = require('node:assert/strict');

// Simple in-memory localStorage mock to satisfy lib/statistics.ts
class MemoryStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = value;
  }
  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new MemoryStorage();

// Import getStatistics after mocking localStorage
const { getStatistics, saveGameResult, clearAllData, getResultsSortedBy } = require('../lib/statistics.ts');

test('getStatistics returns empty stats when storage is empty', () => {
  const stats = getStatistics();
  assert.equal(stats.totalGames, 0);
  assert.deepEqual(stats.results, []);
});

test('clearAllData returns true and resets storage', () => {
  assert.equal(clearAllData(), true);
  const stats = getStatistics();
  assert.equal(stats.totalGames, 0);
});

test('saveGameResult persists data and getResultsSortedBy returns it', () => {
  clearAllData();
  const ok = saveGameResult({
    challengeType: 'test',
    challengeName: 'Unit Test',
    score: 1,
    totalQuestions: 1,
    timeSpent: 1,
    date: new Date().toISOString(),
  });
  assert.equal(ok, true);
  const stats = getStatistics();
  assert.equal(stats.totalGames, 1);
  assert.equal(stats.results.length, 1);
  const sorted = getResultsSortedBy('date');
  assert.equal(sorted.length, 1);
});
