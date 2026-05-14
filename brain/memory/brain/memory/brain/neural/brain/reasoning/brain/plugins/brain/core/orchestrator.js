// ===============================
// 🧠 ORCHESTRATOR CORE
// ===============================

import { NeuralNetwork } from "../neural/network.js";
import { ReasoningEngine } from "../reasoning/engine.js";
import { PluginSystem } from "../plugins/system.js";

export class BrainOrchestrator {
  constructor(config = {}) {
    this.neural = new NeuralNetwork(config.neural || {});
    this.reasoning = new ReasoningEngine();
    this.plugins = new PluginSystem();

    this.state = {
      mode: "idle",
      lastInput: null,
      lastOutput: null
    };
  }

  // -------------------------------
  // MAIN INPUT PIPELINE
  // -------------------------------
  async think(input) {
    this.state.mode = "processing";
    this.state.lastInput = input;

    // 1. Neural processing (pattern layer)
    const neuralOut = this.neural.forward(this.vectorize(input));

    // 2. Reasoning layer (logic layer)
    const reasoningOut = this.reasoning.process(input, {
      neural: neuralOut
    });

    // 3. Plugin augmentation
    const pluginOut = this.plugins.broadcast(input, {
      neural: neuralOut,
      reasoning: reasoningOut
    });

    // 4. Final synthesis
    const output = this.synthesize(neuralOut, reasoningOut, pluginOut);

    this.state.lastOutput = output;
    this.state.mode = "idle";

    return output;
  }

  // -------------------------------
  // SYNTHESIS ENGINE
  // -------------------------------
  synthesize(neural, reasoning, plugins) {
    return {
      response: reasoning.response,
      neuralInsight: neural,
      reasoning,
      plugins,
      meta: {
        timestamp: Date.now()
      }
    };
  }

  // -------------------------------
  // SIMPLE TEXT VECTOR
  // -------------------------------
  vectorize(text) {
    const base = Array(8).fill(0);

    for (let i = 0; i < text.length; i++) {
      base[i % base.length] += text.charCodeAt(i) / 1000;
    }

    return [base];
  }

  // -------------------------------
  // PLUGIN ACCESS
  // -------------------------------
  usePlugin(name, plugin) {
    this.plugins.register(name, plugin);
  }
}
