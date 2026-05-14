// =====================================
// 🧠 LONG TERM MEMORY MODULE
// brain/memory/longTerm.js
// =====================================

// This module represents the persistent memory layer of the BrainCore AI.
// It stores structured experiences, knowledge, and learned patterns over time.
// Unlike ShortTermMemory, this layer is optimized for durability and retrieval depth.

// =====================================
// ⚙️ CONFIGURATION
// =====================================

export const LONG_TERM_CONFIG = {
  debug: true,
  maxRecords: 10000,
  enableTagging: true,
  enableClustering: true,
  enableScoring: true,
  persistenceKey: "BRAIN_LONG_TERM_MEMORY",
  compressionEnabled: false
};

// =====================================
// 🪵 LOGGER
// =====================================

class Logger {
  static log(tag, msg, data) {
    if (!LONG_TERM_CONFIG.debug) return;
    console.log(`[LONG_TERM][${tag}] ${msg}`, data || "");
  }
}

// =====================================
// 🧠 MEMORY NODE
// =====================================

class MemoryNode {
  constructor({ input, output, meta = {} }) {
    this.id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.input = input;
    this.output = output;
    this.meta = meta;

    this.createdAt = Date.now();
    this.updatedAt = Date.now();

    this.score = 1; // relevance score
    this.tags = this._generateTags(input, output);

    this.accessCount = 0;
  }

  _generateTags(input, output) {
    if (!LONG_TERM_CONFIG.enableTagging) return [];

    const text = `${input} ${JSON.stringify(output)}`.toLowerCase();

    const keywords = text
      .split(/\s+/)
      .filter(w => w.length > 4)
      .slice(0, 10);

    return [...new Set(keywords)];
  }

  touch() {
    this.accessCount++;
    this.updatedAt = Date.now();
  }

  boostScore(value = 0.1) {
    this.score += value;
  }

  decayScore(value = 0.01) {
    this.score = Math.max(0, this.score - value);
  }
}

// =====================================
// 🧩 CLUSTER SYSTEM
// =====================================

class MemoryClusterSystem {
  constructor() {
    this.clusters = new Map();
  }

  _getClusterKey(tags = []) {
    return tags.slice(0, 2).join("_") || "uncategorized";
  }

  add(node) {
    const key = this._getClusterKey(node.tags);

    if (!this.clusters.has(key)) {
      this.clusters.set(key, []);
    }

    this.clusters.get(key).push(node.id);
  }

  getCluster(key) {
    return this.clusters.get(key) || [];
  }

  allClusters() {
    return [...this.clusters.entries()];
  }
}

// =====================================
// 🧠 LONG TERM MEMORY CORE
// =====================================

export class LongTermMemory {
  constructor() {
    this.memory = new Map();
    this.clusterSystem = new MemoryClusterSystem();
    this.accessIndex = new Map();

    Logger.log("INIT", "LongTermMemory initialized");

    this._load();
  }

  // -----------------------------
  // ➕ STORE EXPERIENCE
  // -----------------------------

  store(input, output, meta = {}) {
    const node = new MemoryNode({ input, output, meta });

    this.memory.set(node.id, node);
    this.clusterSystem.add(node);

    this._index(node);
    this._enforceLimit();
    this._save();

    Logger.log("STORE", "New long-term memory stored", node);

    return node.id;
  }

  // -----------------------------
  // 🔍 GET BY ID
  // -----------------------------

  get(id) {
    const node = this.memory.get(id);
    if (!node) return null;

    node.touch();
    this._boostRelevance(node);

    return node;
  }

  // -----------------------------
  // 🔎 SEARCH BY TEXT
  // -----------------------------

  search(query) {
    const results = [];
    const q = query.toLowerCase();

    for (const node of this.memory.values()) {
      const haystack = `${node.input} ${JSON.stringify(node.output)} ${node.tags.join(" ")}`.toLowerCase();

      if (haystack.includes(q)) {
        node.touch();
        results.push(node);
      }
    }

    return this._rank(results);
  }

  // -----------------------------
  // 📊 RANKING SYSTEM
  // -----------------------------

  _rank(nodes) {
    if (!LONG_TERM_CONFIG.enableScoring) return nodes;

    return nodes.sort((a, b) => {
      const scoreA = a.score + a.accessCount;
      const scoreB = b.score + b.accessCount;
      return scoreB - scoreA;
    });
  }

  // -----------------------------
  // 📌 INDEXING
  // -----------------------------

  _index(node) {
    for (const tag of node.tags) {
      if (!this.accessIndex.has(tag)) {
        this.accessIndex.set(tag, new Set());
      }
      this.accessIndex.get(tag).add(node.id);
    }
  }

  // -----------------------------
  // 📈 BOOST RELEVANCE
  // -----------------------------

  _boostRelevance(node) {
    node.boostScore(0.2);
  }

  // -----------------------------
  // 📉 DECAY SYSTEM
  // -----------------------------

  decayAll() {
    for (const node of this.memory.values()) {
      node.decayScore(0.01);
    }
  }

  // -----------------------------
  // 🧹 LIMIT ENFORCEMENT
  // -----------------------------

  _enforceLimit() {
    if (this.memory.size <= LONG_TERM_CONFIG.maxRecords) return;

    const sorted = [...this.memory.values()].sort((a, b) => a.score - b.score);

    const toRemove = sorted.slice(0, this.memory.size - LONG_TERM_CONFIG.maxRecords);

    for (const node of toRemove) {
      this.memory.delete(node.id);
    }

    Logger.log("CLEANUP", `Removed ${toRemove.length} low-score memories`);
  }

  // -----------------------------
  // 💾 PERSISTENCE (LOCAL)
  // -----------------------------

  _save() {
    try {
      const data = JSON.stringify([...this.memory.entries()]);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(LONG_TERM_CONFIG.persistenceKey, data);
      }
    } catch (err) {
      Logger.log("ERROR", "Save failed", err);
    }
  }

  _load() {
    try {
      if (typeof localStorage === "undefined") return;

      const raw = localStorage.getItem(LONG_TERM_CONFIG.persistenceKey);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      this.memory = new Map(parsed);

      Logger.log("LOAD", "Memory restored", this.memory.size);
    } catch (err) {
      Logger.log("ERROR", "Load failed", err);
    }
  }

  // -----------------------------
  // 📊 STATS
  // -----------------------------

  stats() {
    return {
      size: this.memory.size,
      clusters: this.clusterSystem.allClusters().length,
      indexSize: this.accessIndex.size
    };
  }

  // -----------------------------
  // 🧠 CONTEXT RECALL
  // -----------------------------

  recallRelated(query, limit = 5) {
    return this.search(query).slice(0, limit);
  }

  // -----------------------------
  // ❌ CLEAR ALL
  // -----------------------------

  clear() {
    this.memory.clear();
    this.accessIndex.clear();
    this.clusterSystem = new MemoryClusterSystem();

    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(LONG_TERM_CONFIG.persistenceKey);
    }

    Logger.log("CLEAR", "Long term memory cleared");
  }
}

// =====================================
// 🚀 EXPORT DEFAULT
// =====================================

export default LongTermMemory;
