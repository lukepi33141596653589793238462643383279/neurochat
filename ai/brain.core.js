// ===============================
// 🧠 BRAIN CORE SYSTEM (NeuroChat AI)
// brain.core.js
// Highly modular AI orchestrator architecture
// ===============================

// ===============================
// 🔧 CONFIGURATION
// ===============================

const BRAIN_CONFIG = {
  debug: true,
  version: "1.0.0",
  memoryLimit: 1000,
  maxContextTokens: 4096,
  enablePlugins: true,
  enableLearning: true,
  enableReasoning: true,
  logLevel: "verbose"
};

// ===============================
// 🪵 LOGGER SYSTEM
// ===============================

class Logger {
  static log(type, message, data = null) {
    if (!BRAIN_CONFIG.debug) return;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`, data || "");
  }

  static info(msg, data) { this.log("INFO", msg, data); }
  static warn(msg, data) { this.log("WARN", msg, data); }
  static error(msg, data) { this.log("ERROR", msg, data); }
  static brain(msg, data) { this.log("BRAIN", msg, data); }
}

// ===============================
// 🧠 MEMORY SYSTEM
// ===============================

class MemorySystem {
  constructor() {
    this.shortTerm = [];
    this.longTerm = [];
    this.emotionalMemory = [];
  }

  storeShortTerm(data) {
    this.shortTerm.push(data);
    if (this.shortTerm.length > BRAIN_CONFIG.memoryLimit) {
      this.shortTerm.shift();
    }
    Logger.info("Stored in short-term memory", data);
  }

  storeLongTerm(data) {
    this.longTerm.push({
      id: Date.now(),
      data
    });
    Logger.info("Stored in long-term memory", data);
  }

  recall(query) {
    return this.longTerm.filter(m =>
      JSON.stringify(m.data).includes(query)
    );
  }

  emotionalStore(emotion, intensity) {
    this.emotionalMemory.push({ emotion, intensity, time: Date.now() });
  }
}

// ===============================
// 🔌 EVENT BUS SYSTEM
// ===============================

class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  }
}

// ===============================
// ⚙️ NEURON PROCESSOR
// ===============================

class Neuron {
  constructor(id) {
    this.id = id;
    this.weight = Math.random();
    this.bias = Math.random();
  }

  activate(input) {
    return (input * this.weight) + this.bias;
  }
}

class NeuralLayer {
  constructor(size) {
    this.neurons = Array.from({ length: size }, (_, i) => new Neuron(i));
  }

  process(input) {
    return this.neurons.map(n => n.activate(input));
  }
}

class NeuralNetwork {
  constructor() {
    this.layers = [
      new NeuralLayer(5),
      new NeuralLayer(3),
      new NeuralLayer(1)
    ];
  }

  forward(input) {
    let output = input;
    this.layers.forEach(layer => {
      output = layer.process(output);
    });
    return output;
  }
}

// ===============================
// 🧩 PLUGIN SYSTEM
// ===============================

class PluginSystem {
  constructor() {
    this.plugins = [];
  }

  register(plugin) {
    this.plugins.push(plugin);
    Logger.info("Plugin registered", plugin.name);
  }

  executeAll(context) {
    return this.plugins.map(p => p.run(context));
  }
}

// ===============================
// 🧠 REASONING ENGINE
// ===============================

class ReasoningEngine {
  analyze(input) {
    const words = input.split(" ");

    const complexity = words.length > 10 ? "high" : "low";

    return {
      complexity,
      sentiment: this.fakeSentiment(input),
      keywords: words.slice(0, 5)
    };
  }

  fakeSentiment(text) {
    const positive = ["good", "great", "love", "awesome"];
    const negative = ["bad", "hate", "error", "bug"];

    let score = 0;

    positive.forEach(p => { if (text.includes(p)) score++; });
    negative.forEach(n => { if (text.includes(n)) score--; });

    return score;
  }
}

// ===============================
// 🔄 CONTEXT MANAGER
// ===============================

class ContextManager {
  constructor() {
    this.context = [];
  }

  add(input, output) {
    this.context.push({ input, output, time: Date.now() });
  }

  getLast(n = 5) {
    return this.context.slice(-n);
  }
}

// ===============================
// 🧠 MAIN BRAIN CORE
// ===============================

class BrainCore {
  constructor() {
    this.memory = new MemorySystem();
    this.eventBus = new EventBus();
    this.neural = new NeuralNetwork();
    this.plugins = new PluginSystem();
    this.reasoning = new ReasoningEngine();
    this.context = new ContextManager();

    Logger.brain("BrainCore initialized");
  }

  process(input) {
    Logger.info("Processing input", input);

    // Store memory
    this.memory.storeShortTerm(input);

    // Analyze reasoning
    const analysis = this.reasoning.analyze(input);

    // Neural processing
    const neuralOutput = this.neural.forward(input.length);

    // Plugin execution
    const pluginOutput = this.plugins.executeAll(input);

    // Build response
    const response = this.generateResponse(input, analysis, neuralOutput, pluginOutput);

    // Store context
    this.context.add(input, response);

    // Long term memory
    this.memory.storeLongTerm({ input, response, analysis });

    return response;
  }

  generateResponse(input, analysis, neural, plugins) {
    return {
      input,
      analysis,
      neuralScore: neural,
      pluginResults: plugins,
      message: `Processed input with complexity ${analysis.complexity}`
    };
  }

  learn(data) {
    if (!BRAIN_CONFIG.enableLearning) return;
    this.memory.storeLongTerm(data);
    Logger.brain("Learning from data");
  }

  recall(query) {
    return this.memory.recall(query);
  }
}

// ===============================
// 🚀 EXPORT INSTANCE
// ===============================

const brain = new BrainCore();

export default brain;
