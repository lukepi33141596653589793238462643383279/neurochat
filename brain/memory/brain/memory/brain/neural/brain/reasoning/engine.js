// ===============================
// 🧠 REASONING ENGINE MODULE
// ===============================

export class ReasoningEngine {
  constructor() {
    this.rules = [];
    this.memory = [];
  }

  // -------------------------------
  // ADD RULE
  // -------------------------------
  addRule(rule) {
    this.rules.push(rule);
  }

  // -------------------------------
  // PROCESS INPUT
  // -------------------------------
  process(input, context = {}) {
    const thoughts = [];

    for (const rule of this.rules) {
      const result = rule(input, context);
      if (result) thoughts.push(result);
    }

    const conclusion = this.synthesize(thoughts, input);

    this.memory.push({
      input,
      thoughts,
      conclusion,
      timestamp: Date.now()
    });

    return conclusion;
  }

  // -------------------------------
  // SYNTHESIS LOGIC
  // -------------------------------
  synthesize(thoughts, input) {
    if (thoughts.length === 0) {
      return {
        type: "fallback",
        response: "I could not derive a strong reasoning path."
      };
    }

    return {
      type: "reasoned",
      input,
      insights: thoughts,
      response: thoughts.join(" | ")
    };
  }

  // -------------------------------
  // GET HISTORY
  // -------------------------------
  getMemory() {
    return this.memory;
  }
}
