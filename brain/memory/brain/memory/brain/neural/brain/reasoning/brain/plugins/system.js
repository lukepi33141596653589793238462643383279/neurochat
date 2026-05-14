// ===============================
// 🔌 PLUGIN SYSTEM MODULE
// ===============================

export class PluginSystem {
  constructor() {
    this.plugins = new Map();
  }

  // -------------------------------
  // REGISTER PLUGIN
  // -------------------------------
  register(name, plugin) {
    if (!plugin || typeof plugin.run !== "function") {
      throw new Error("Invalid plugin structure");
    }

    this.plugins.set(name, plugin);
  }

  // -------------------------------
  // REMOVE PLUGIN
  // -------------------------------
  remove(name) {
    this.plugins.delete(name);
  }

  // -------------------------------
  // EXECUTE PLUGIN
  // -------------------------------
  execute(name, input, context = {}) {
    const plugin = this.plugins.get(name);

    if (!plugin) {
      return { error: "Plugin not found" };
    }

    return plugin.run(input, context);
  }

  // -------------------------------
  // RUN ALL PLUGINS
  // -------------------------------
  broadcast(input, context = {}) {
    const results = [];

    for (const [name, plugin] of this.plugins.entries()) {
      results.push({
        plugin: name,
        output: plugin.run(input, context)
      });
    }

    return results;
  }

  // -------------------------------
  // LIST PLUGINS
  // -------------------------------
  list() {
    return Array.from(this.plugins.keys());
  }
}
