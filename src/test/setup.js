// Test setup: provide a minimal localStorage so the demo data layer (mockDb.js)
// can run under Vitest's `node` environment without a real browser.

class MemoryStorage {
  constructor() {
    this.store = new Map()
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null
  }
  setItem(key, value) {
    this.store.set(key, String(value))
  }
  removeItem(key) {
    this.store.delete(key)
  }
  clear() {
    this.store.clear()
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = new MemoryStorage()
}
