/**
 * Delimiters for Quic
 */
const delimiter = [",", ".", "~", ":", "_"];

/**
 * Enum for result output types values.
 * @enum {string}
 */
export const allowedType = {
  decimal: ".",
  invbinary: "~",
  binary: ":",
};

export const ItemTypes = {
  GATES: "gate",
};

/**
 * Rotation Gates (Rx, Ry, Rz)
 */
export const rGates = ["x", "y", "z"];

/**
 * Parametric Gates
 */
export const parametricGates = ["x", "y", "z", "U", "m", "M"];

/**
 * Gates that can connect with C gate
 */
const controlledGates = ["X", "Y", "Z", "P", "T", "N", "s", "U", "H"].concat(
  rGates
);

/**
 * Gates with C gate included
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
 * Calculate number of Qubits required given string - REFACTORED VERSION
 * Now properly handles complex gates like U{theta|phi|lambda}
 *
 * @param {string} circuit Quic String e.g HU{1.0|2.0|3.0}I,CN
 * @returns {number} Number of Qubits (logical gates, not characters)
 */
const stringToQubits = (circuit) => {
  // Handle edge cases
  if (!circuit || circuit.length === 0) {
    return 0;
  }

  // Remove delimiter if present
  circuit = quicDelimiterRemoval(circuit);

  // Split into segments (columns)
  const segments = circuit.split(",");

  // Find the maximum number of logical gates in any segment
  // This determines the qubit count needed for the circuit
  return segments.reduce((maxQubits, segment) => {
    // Use parseSegmentIntoGates to properly count logical gates
    const gatesInSegment = parseSegmentIntoGates(segment.trim());
    return Math.max(maxQubits, gatesInSegment.length);
  }, 0);
};

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

/**
 * Parse segment into individual gates
 * Handles both single-character gates (e.g. 'H', 'S' etc.) and multi-character gates (e.g. U{theta,phi,lambda})
 * @param {string} segment
 * @returns {Array} List of gates in segment
 */
export const parseSegmentIntoGates = (segment) => {
  const gates = [];
  let i = 0;

  while (i < segment.length) {
    // Check if we're at the start of a U{...} or R{...} pattern
    if (
      (segment[i] === "U" || rGates.some((gate) => segment[i] === gate)) &&
      i + 1 < segment.length &&
      segment[i + 1] === "{"
    ) {
      // Find the matching closing brace
      let braceCount = 0;
      let j = i + 1; // Start from opening brace

      while (j < segment.length) {
        if (segment[j] === "{") braceCount++;
        else if (segment[j] === "}") braceCount--;

        if (braceCount === 0) break; // Found the matching closing brace
        j++;
      }

      if (braceCount === 0) {
        // Successfully found complete U{...} pattern
        const uGate = segment.substring(i, j + 1); // Include the closing brace
        gates.push(uGate);
        i = j + 1; // Move past the entire U{...} pattern
      } else {
        // Malformed U gate - treat U as single character for now
        // The validation will catch this as an invalid gate later
        gates.push(segment[i]);
        i++;
      }
    } else {
      // Regular single-character gate
      gates.push(segment[i]);
      i++;
    }
  }

  return gates;
};

/**
 * Validate U gate parameter format
 * @param {string} gate
 */
const validateUGateFormat = (gate) => {
  // Pattern to match U{number,number,number} where numbers can be decimals
  const uGatePattern = /^U\{([\d.-]+)\|([\d.-]+)\|([\d.-]+)\}$/;
  const match = gate.match(uGatePattern);

  if (!match) {
    return {
      isValid: false,
      message: `Invalid U gate format: "${gate}". Expected format: U{theta|phi|lambda}`,
    };
  }

  // Extract and validate the three parameters
  const [, theta, phi, lambda] = match;

  // Check if all parameters are valid numbers
  const params = [theta, phi, lambda];
  for (let i = 0; i < params.length; i++) {
    const num = parseFloat(params[i]);
    if (isNaN(num)) {
      return {
        isValid: false,
        message: `Invalid parameter in U gate "${gate}": "${params[i]}" is not a valid number`,
      };
    }
  }

  return { isValid: true };
};

const validateRGateFormat = (gate) => {
  // Pattern to match R{number} where number can be decimals
  const rGatePattern = /^[xyz]\{([\d.-]+)\}$/;
  const match = gate.match(rGatePattern);

  if (!match) {
    return {
      isValid: false,
      message: `Invalid R gate format: "${gate}". Expected format R{alpha}`,
    };
  }

  // Extract and validate alpha
  const [, alpha] = match;

  // Check if alpha is valid
  const num = parseFloat(alpha);
  if (isNaN(num)) {
    return {
      isValid: false,
      message: `Invalid alpha parameter in R gate "${gate}": "${alpha}" is not a valid number`,
    };
  }

  return { isValid: true };
};

/**
 * Validate segment (QuICScript column)
 * @param {string} segment
 * @param {number} i
 * @param {number} expectedGateCount
 * @param {Array} allowedGates
 * @returns {Object}
 */
const validateSegment = (segment, i, expectedGateCount, allowedGates) => {
  // Parse segment into individual gates (handling both single chars and U{...} patterns)
  const gatesInSegment = parseSegmentIntoGates(segment);

  // Set expected gate count from first segment (this determines qubit count)
  if (expectedGateCount === null) {
    expectedGateCount = gatesInSegment.length;
    if (expectedGateCount === 0) {
      return {
        isValid: false,
        message: `First segment "${segment}" is empty`,
      };
    }
  }

  // Check if this segment has the same number of gates as expected
  if (gatesInSegment.length !== expectedGateCount) {
    return {
      isValid: false,
      message: `Inconsistent qubit count: segment "${segment}" at position ${
        i + 1
      } has ${gatesInSegment.length} qubit${
        gatesInSegment.length > 1 ? "s" : ""
      }, expected ${expectedGateCount} qubits`,
    };
  }

  // Validate each gate in this segment
  for (let j = 0; j < gatesInSegment.length; j++) {
    const gate = gatesInSegment[j];

    // Special handling for U gates with parameters
    if (gate.startsWith("U{")) {
      const uValidation = validateUGateFormat(gate);
      if (!uValidation.isValid) {
        return {
          isValid: false,
          message: `${
            uValidation.message
          } in segment "${segment}" at position ${i + 1}, qubit ${j}`,
        };
      }
      // U gates with parameters are automatically considered valid if format is correct
    } else if (
      gate.startsWith("x{") ||
      gate.startsWith("y{") ||
      gate.startsWith("z{")
    ) {
      const rValidation = validateRGateFormat(gate);
      if (!rValidation.isValid) {
        return {
          isValid: false,
          message: `${
            rValidation.message
          } in segment "${segment}" at position ${i + 1}, qubit ${j}`,
        };
      }
    } else {
      // Regular single-character gate validation
      if (!allowedGates.includes(gate) && gate !== "I") {
        return {
          isValid: false,
          message: `Invalid gate "${gate}" in segment "${segment}" at position ${
            i + 1
          }, qubit ${j}`,
        };
      }
    }
  }

  return { isValid: true };
};

/**
 * Enhanced validation function that includes max qubit checking
 * This consolidates validation logic in one place
 *
 * @param {string} content Circuit string to validate
 * @param {Array} allowedGates Array of allowed gate patterns
 * @param {number} maxQubits Maximum allowed qubits (optional)
 * @returns {Object} Validation result with isValid, message, and qubitCount
 */
const validateQuantumGatePattern = (
  content,
  allowedGates = null,
  maxQubits = null
) => {
  if (content == null) {
    return {
      isValid: false,
      message:
        "Incorrect circuit.\nPlease enter a proper circuit, e.g. ?input=HI,CN.",
      qubitCount: 0,
    };
  }

  // Remove whitespace and preserve original case for parsing
  let cleanContent = content.trim();

  // Check if it's not empty
  if (!cleanContent) {
    return {
      isValid: false,
      message: "Circuit is empty",
      qubitCount: 0,
    };
  }

  // Split by commas and clean each gate
  const gateSegments = cleanContent.split(",").map((segment) => segment.trim());

  // Check if there are any gate segments
  if (gateSegments.length === 0) {
    return {
      isValid: false,
      message: "No gate segments found",
      qubitCount: 0,
    };
  }

  // Track the expected number of gates per segment (qubits)
  let expectedGateCount = null;

  // Validate each gate segment
  for (let i = 0; i < gateSegments.length; i++) {
    let segment = gateSegments[i];

    // Check for empty segments
    if (!segment) {
      return {
        isValid: false,
        message: `Empty gate segment at position ${i + 1}`,
        qubitCount: expectedGateCount || 0,
      };
    }

    // Check for end delimiter and remove it if it's there for subsequent comparisons
    if (
      i === gateSegments.length - 1 &&
      delimiter.some((delim) => segment.slice(-1) === delim)
    ) {
      segment = segment.slice(0, -1);
    }

    const segmentValidationResult = validateSegment(
      segment,
      i,
      expectedGateCount,
      allowedGates
    );

    if (!segmentValidationResult.isValid) {
      return {
        ...segmentValidationResult,
        message: `Error in circuit -> "${content}"\n${segmentValidationResult.message}`,
        qubitCount: expectedGateCount || 0,
      };
    }

    // Update expected gate count from first valid segment
    if (expectedGateCount === null) {
      const gatesInSegment = parseSegmentIntoGates(segment);
      expectedGateCount = gatesInSegment.length;
    }
  }

  // Check against maximum qubit limit if provided
  if (maxQubits !== null && expectedGateCount > maxQubits) {
    return {
      isValid: false,
      message: `Circuit requires ${expectedGateCount} qubits but maximum allowed is ${maxQubits}`,
      qubitCount: expectedGateCount,
    };
  }

  return {
    isValid: true,
    message: `Valid quantum circuit with ${expectedGateCount} qubits and ${
      gateSegments.length
    } time step(s): ${gateSegments.join(", ")}`,
    qubitCount: expectedGateCount,
  };
};

/**
 * Helper method to clean up raw circuit input by removing parameter information
 * from parameterized gates, specifically U gates with braced parameters.
 *
 * This function converts complex parameterized gates like U{0|0.392699|0} back to
 * simple U gates.
 *
 * @param {string} circuitString - The raw circuit string containing parameterized gates
 * @returns {string} - Cleaned circuit string with parameters removed
 */
const cleanParameterizedGates = (circuitString) => {
  // Handle null, undefined, or empty input
  if (!circuitString || typeof circuitString !== "string") {
    return "";
  }

  // Regular expression explanation:
  // U        - Matches the literal character 'U'
  // \{       - Matches opening brace (escaped because { is a special regex character)
  // [^}]*    - Matches any character except '}' zero or more times
  //            This captures all the parameter content inside the braces
  // \}       - Matches closing brace (escaped)
  //
  // The 'g' flag means "global" - replace all occurrences, not just the first one
  const parameterizedUGatePattern = /U\{[^}]*\}/g;

  // Replace all parameterized U gates with simple U gates
  // This preserves the circuit structure while removing parameter complexity
  const cleanedCircuit = circuitString.replace(parameterizedUGatePattern, "U");

  return cleanedCircuit;
};

export {
  stringToQubits,
  delimiter,
  controlledGates,
  controlledGatesWithC,
  stringSplitSameLength,
  quicDelimiterRemoval,
  processColumnForControlled,
  processColumnForSwap,
  beforeAfterDiff,
  parseComplexNumber,
  validateQuantumGatePattern,
  cleanParameterizedGates,
};
