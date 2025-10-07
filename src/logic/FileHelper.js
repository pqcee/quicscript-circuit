import { Gates } from "./Gates";
import { rGates } from "./Helper";

/**
 * Aggressive pattern finding for QuICScript string to generate
 * {L <number_of_repetitions> <pattern>} compression
 */
export const findOptimalCompression = (content) => {
  const parts = content.split(",");
  const n = parts.length;

  // Dynamic programming approach to find optimal compression
  // dp[i] = minimum compressed length to encode parts[0...i-1]
  const dp = new Array(n + 1).fill(Infinity);
  const choice = new Array(n + 1).fill(null);
  dp[0] = 0;

  for (let i = 0; i < n; i++) {
    if (dp[i] === Infinity) continue;

    // Try not compressing (single element)
    if (dp[i] + 1 < dp[i + 1]) {
      dp[i + 1] = dp[i] + 1;
      choice[i + 1] = { type: "single", start: i, end: i + 1 };
    }

    // Try all possible patterns starting at position i
    for (let patternLen = 1; patternLen <= n - i; patternLen++) {
      const pattern = parts.slice(i, i + patternLen);
      let reps = 1;
      let j = i + patternLen;

      // Count repetitions
      while (j + patternLen <= n) {
        let matches = true;
        for (let k = 0; k < patternLen; k++) {
          if (parts[j + k] !== pattern[k]) {
            matches = false;
            break;
          }
        }
        if (!matches) break;
        reps++;
        j += patternLen;
      }

      if (reps >= 2) {
        const endPos = i + patternLen * reps;
        // Cost of encoding this pattern (1 for the compressed notation)
        if (dp[i] + 1 < dp[endPos]) {
          dp[endPos] = dp[i] + 1;
          choice[endPos] = {
            type: "pattern",
            start: i,
            end: endPos,
            pattern,
            repetitions: reps,
          };
        }
      }
    }
  }

  // Reconstruct the optimal compression
  const result = [];
  let pos = n;

  while (pos > 0) {
    const ch = choice[pos];
    if (ch.type === "single") {
      result.unshift(parts[ch.start]);
    } else if (ch.type === "pattern") {
      // Unified format without brackets
      result.unshift(`{L ${ch.repetitions} ${ch.pattern.join(",")}}`);
    }
    pos = ch.start;
  }

  return result;
};

/**
 * Add U and/or R gate parameters for file format
 * @param {string[]} compressed
 * @param {Gates} gates
 * @returns
 */
export const processGates = (compressed, gates) => {
  const result = [];

  for (let i = 0; i < compressed.length; i++) {
    const element = compressed[i];
    result.push(element);

    // Skip if element already starts with parameter block
    if (element.startsWith("{L")) {
      continue;
    }

    // U gate takes precedence
    if (element.includes("U")) {
      const { theta, phi, lambda } = gates.getUGateColumnValue(i);
      result.push(`{U ${theta} ${phi} ${lambda}}`);
    }
    // Check R gates only if no U gate was found
    else if (rGates.some((gate) => element.includes(gate))) {
      const firstRGate = rGates.find((gate) => element.includes(gate));
      const alpha = gates.getRGateValue(i, firstRGate);
      result.push(`{R ${alpha}}`);
    }
  }

  return result;
};
