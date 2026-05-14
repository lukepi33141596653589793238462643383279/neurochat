// ===============================
// 🧠 NEURAL NETWORK CORE MODULE
// ===============================

export class NeuralNetwork {
  constructor(config = {}) {
    this.layers = config.layers || [64, 64, 32];
    this.learningRate = config.learningRate || 0.01;

    this.weights = [];
    this.biases = [];

    this.initialized = false;
  }

  // -------------------------------
  // INIT NETWORK
  // -------------------------------
  init() {
    for (let i = 0; i < this.layers.length - 1; i++) {
      const rows = this.layers[i];
      const cols = this.layers[i + 1];

      this.weights.push(this.randomMatrix(rows, cols));
      this.biases.push(this.randomMatrix(1, cols));
    }

    this.initialized = true;
    return this;
  }

  // -------------------------------
  // FORWARD PROPAGATION
  // -------------------------------
  forward(input) {
    if (!this.initialized) this.init();

    let output = input;

    for (let i = 0; i < this.weights.length; i++) {
      output = this.activate(
        this.dot(output, this.weights[i]),
        this.biases[i]
      );
    }

    return output;
  }

  // -------------------------------
  // ACTIVATION FUNCTION
  // -------------------------------
  activate(matrix, bias) {
    return matrix.map((row, i) =>
      row.map((v, j) => this.sigmoid(v + (bias[0][j] || 0)))
    );
  }

  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  // -------------------------------
  // MATRIX OPS
  // -------------------------------
  dot(a, b) {
    const result = [];

    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }

    return result;
  }

  randomMatrix(rows, cols) {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.random() * 2 - 1)
    );
  }
}
