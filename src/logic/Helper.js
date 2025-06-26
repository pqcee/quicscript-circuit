/**
 * Delimiters for Quic
 */
const delimiter = [",", ".", "~", ":", "_"];

/**
 * Allowed Gates on the builder
 */
const allowedGates =
  typeof gates !== "undefined"
    ? gates
    : ["H", "X", "Y", "Z", "C", "N", "P", "T", "I", "s", "U", "d", "m"];

//Remove "U" from allowedGates array if exists
const UGateIndex = allowedGates.indexOf("U");
if (import.meta.env.COMMUNITY && UGateIndex != -1) {
  allowedGates.splice(UGateIndex, 1);
}

/**
 * Gates that can connect with C gate
 */
const controlledGates = ["X", "Y", "Z", "P", "T", "N", "s", "U", "H"];

/**
 * Gates that can connect with C gate
 */
const controlledGatesWithC = controlledGates.concat("C");

/**
 * Remove delimiter if exist
 * @param {string} circuit
 * @returns {string}
 */
function quicDelimiterRemoval(circuit) {
  if (delimiter.includes(circuit[circuit.length - 1]))
    circuit = circuit.slice(0, -1);
  return circuit;
}

/**
 * Calculate number of Qubits required given string
 * Require {string[]} delimiter
 * @param {string} circuit Quic String e.g HI,CN
 * @returns {number} Number of Qubits
 */
function stringToQubits(circuit) {
  circuit = quicDelimiterRemoval(circuit);
  return circuit.split(",").reduce((a, c) => Math.max(a, c.length), 0);
}

/**
 * Checks if there's a controlled and C gate connection
 *
 * If returns.last == 0, there isn't a connection found
 * @param {string[]} columnArray Column Array of Gates e.g ['H','I','H']
 * @returns {{first: number, last: number} | null}
 */
function processColumnForControlled(columnArray) {
  if (columnArray.length >= 2) {
    /** @type {number} */
    let first;
    /** @type {number} */
    let last = 0;
    /** @type {boolean} */
    let cgateFound = false;
    /** @type {boolean} */
    let controlledgateFound = false;
    columnArray.forEach((gate, i) => {
      if (gate == "C" || controlledGates.includes(gate)) {
        if (first == null) first = i;
        last = i;
        if (gate == "C") cgateFound = true;
        else if (controlledGates.includes(gate)) controlledgateFound = true;
      }
    });

    if (cgateFound && controlledgateFound) return { first, last };
  }
  return null;
}

/**
 * Checks if there's a s and s gate connection
 * If returns.last == 0, there isn't a connection found
 * Contraints:
 * - There can only have 1 pair of s gates
 * @param {string[]} columnArray Column Array of Gates e.g ['H','I','s']
 * @returns {{first: number, last: number} | null}
 */
function processColumnForSwap(columnArray) {
  const S_GATE = "s";
  if (columnArray.length >= 2) {
    /** @type {number} */
    let first;
    /** @type {number} */
    let last = 0;
    for (let i = 0; i < columnArray.length; i++) {
      const gate = columnArray[i];
      if (gate == S_GATE) {
        if (first == null) first = i;
        else if (last == 0) last = i;
        else return null; /** More than 2 s gates found */
      }
    }

    if (first != null && last > 0) return { first, last };
  }
  return null;
}

/**
 * @param {string} str
 * @param {char} split
 * @returns true if string split is equal
 */
function stringSplitSameLength(str, split = ",") {
  const arr = str.split(split);
  if (arr.length == 0) return true;
  const firstLength = arr[0].length;
  return !arr.some((partArr) => firstLength != partArr.length);
}

/**
 * Returns the character difference between two strings
 * @param {string} before
 * @param {string} after
 * @returns string
 */
function beforeAfterDiff(before, after) {
  const longer = before.length > after.length ? before : after;
  const shorter = before.length > after.length ? after : before;
  let diff = "";
  for (let i = 0; i < shorter.length; i++) {
    if (before[i] != after[i]) diff += after[i];
  }
  if (before.length != after.length) diff += longer.slice(shorter.length);
  return diff;
}

/**
 * Helper function to parse complex numbers from string
 * Example input: "1.2+3.4i", "-1.2-3.4i", "1.2i", "-1.2i", "1.2"
 * Expected Output: { real: 1.2, imaginary: 3.4 }, { real: -1.2, imaginary: -3.4 }, { real: 0, imaginary: 1.2 }, { real: 0, imaginary: -1.2 }, { real: 1.2, imaginary: 0 }
 * Returns { real: number, imaginary: number } if successful, null if unable to parse
 * @param {string} result
 * @returns null || { real: number, imaginary: number }
 */
function parseComplexNumber(result) {
  let real = 0,
    imaginary = 0;
  const complexRegex = /^([-+]?\d*\.?\d*)([-+]?\d*\.?\d*)i?$/;
  const match = result.match(complexRegex);

  if (match) {
    real = parseFloat(match[1]) || 0;
    imaginary = parseFloat(match[2]) || 0;
  }
  if (imaginary == 0) {
    if (real == 0) return null; // Unable to parse result
    else if (result.includes("i")) return { real: 0, imaginary: real };
  }
  return { real, imaginary };
}

export {
  stringToQubits,
  delimiter,
  allowedGates,
  controlledGates,
  controlledGatesWithC,
  stringSplitSameLength,
  quicDelimiterRemoval,
  processColumnForControlled,
  processColumnForSwap,
  beforeAfterDiff,
  parseComplexNumber,
};
