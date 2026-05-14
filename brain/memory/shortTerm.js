// =====================================
// 🧠 SHORT TERM MEMORY MODULE
// brain/memory/shortTerm.js
// =====================================

// This module manages the short-term working memory of the AI BrainCore.
// It behaves like a fast-access cache with TTL, indexing, and pruning.

// =====================================
// ⚙️ CONFIGURATION
// =====================================

export const SHORT_TERM_CONFIG = {
  maxSize: 200,              // maximum items in memory
  ttl: 1000 * 60 * 10,       // 10 minutes expiration
  enableIndexing: true,
  enableAutoCleanup: true,
  debug: true
};

// =====================================
// 🪵 LOGGER
// =====================================

class Logger {
  static log(tag, msg, data) {
    if (!SHORT_TERM_CONFIG.debug) return;
    console.log(`[SHORT_TERM][${tag}] ${msg}`, data || "");
  }
}

// =====================================
// 🧠 MEMORY ITEM STRUCTURE
// =====================================

class MemoryItem {
  constructor({ key, value, meta = {} }) {
    this.id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.key = key;
    this.value = value;
    this.meta = meta;
    this.createdAt = Date.now();
    this.lastAccessed = Date.now();
    this.accessCount = 0;
  }

  touch() {
    this.lastAccessed = Date.now();
    this.accessCount++;
  }

  isExpired(ttl) {
    return Date.now() - this.createdAt > ttl;
  }
}

// =====================================
// 🧩 INDEX SYSTEM
// =====================================

class MemoryIndex {
  constructor() {
    this.index = new Map();
  }

  add(item) {
    if (!SHORT_TERM_CONFIG.enableIndexing) return;

    const words = (item.key + " " + JSON.stringify(item.value))
      .toLowerCase()
      .split(/\s+/);

    for (const word of words) {
      if (!this.index.has(word)) {
        this.index.set(word, new Set());
      }
      this.index.get(word).add(item.id);
    }
  }

  search(query) {
    const words = query.toLowerCase().split(/\s+/);
    const resultSets = [];

    for (const word of words) {
      if (this.index.has(word)) {
        resultSets.push(this.index.get(word));
      }
    }

    if (resultSets.length === 0) return [];

    // intersect sets
    let result = resultSets[0];
    for (const set of resultSets.slice(1)) {
      result = new Set([...result].filter(x => set.has(x)));
    }

    return [...result];
  }

  remove(id) {
    for (const [word, set] of this.index.entries()) {
      set.delete(id);
      if (set.size === 0) this.index.delete(word);
    }
  }
}

// =====================================
// 🧠 SHORT TERM MEMORY CORE
// =====================================

export class ShortTermMemory {
  constructor() {
    this.memory = new Map();
    this.index = new MemoryIndex();
    this.order = [];

    Logger.log("INIT", "ShortTermMemory initialized");
  }

  // -----------------------------
  // ➕ STORE
  // -----------------------------

  store(key, value, meta = {}) {
    const item = new MemoryItem({ key, value, meta });

    this.memory.set(item.id, item);
    this.order.push(item.id);

    this.index.add(item);

    Logger.log("STORE", "Item stored", item);

    this._enforceLimit();
    return item.id;
  }

  // -----------------------------
  // 🔍 GET BY ID
  // -----------------------------

  get(id) {
    const item = this.memory.get(id);
    if (!item) return null;

    item.touch();
    return item;
  }

  // -----------------------------
  // 🔎 SEARCH
  // -----------------------------

  search(query) {
    const ids = this.index.search(query);
    return ids.map(id => this.get(id)).filter(Boolean);
  }

  // -----------------------------
  // 📦 GET ALL
  // -----------------------------

  getAll() {
    return [...this.memory.values()];
  }

  // -----------------------------
  // ❌ DELETE
  // -----------------------------

  delete(id) {
    const item = this.memory.get(id);
    if (!item) return false;

    this.memory.delete(id);
    this.index.remove(id);
    this.order = this.order.filter(x => x !== id);

    Logger.log("DELETE", "Item removed", id);
    return true;
  }

  // -----------------------------
  // 🧹 CLEANUP EXPIRED
  // -----------------------------

  cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [id, item] of this.memory.entries()) {
      if (item.isExpired(SHORT_TERM_CONFIG.ttl)) {
        this.delete(id);
        removed++;
      }
    }

    Logger.log("CLEANUP", `Removed ${removed} expired items`);
  }

  // -----------------------------
  // 📉 ENFORCE LIMIT
  // -----------------------------

  _enforceLimit() {
    while (this.memory.size > SHORT_TERM_CONFIG.maxSize) {
      const oldestId = this.order.shift();
      if (oldestId) this.delete(oldestId);
    }
  }

  // -----------------------------
  // 📊 STATS
  // -----------------------------

  stats() {
    return {
      size: this.memory.size,
      maxSize: SHORT_TERM_CONFIG.maxSize,
      indexSize: this.index.index.size
    };
  }

  // -----------------------------
  // 🔄 CLEAR ALL
  // -----------------------------

  clear() {
    this.memory.clear();
    this.index = new MemoryIndex();
    this.order = [];

    Logger.log("CLEAR", "Memory cleared");
  }

  // -----------------------------
  // ⚙️ AUTO CLEANUP LOOP
  // -----------------------------

  startAutoCleanup(interval = 60000) {
    if (!SHORT_TERM_CONFIG.enableAutoCleanup) return;

    setInterval(() => {
      this.cleanup();
    }, interval);
  }
}

// =====================================
// 🚀 DEFAULT EXPORT (OPTIONAL)
// =====================================

export default ShortTermMemory;
