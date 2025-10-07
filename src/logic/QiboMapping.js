// Qibo Gate Class to QASM Name Mapping + Your Circuit Language
const QIBO_GATE_MAPPING = {
  // Single Qubit Gates
  H: "h",
  X: "x",
  Y: "y",
  Z: "z",
  S: "s",
  T: "t",
  SX: "sx",
  SXDG: "sxdg",
  SDG: "sdg",
  TDG: "tdg",
  I: "id",

  // Rotation Gates
  RX: "rx",
  RY: "ry",
  RZ: "rz",
  U1: "u1",
  U2: "u2",
  U3: "u3",
  PRX: "prx",
  GPI: "gpi",
  GPI2: "gpi2",

  // Two Qubit Gates
  CNOT: "cx",
  CY: "cy",
  CZ: "cz",
  CSX: "csx",
  CSXDG: "csxdg",
  CRX: "crx",
  CRY: "cry",
  CRZ: "crz",
  CU1: "cu1",
  CU2: "cu2",
  CU3: "cu3",
  SWAP: "swap",
  iSWAP: "iswap",
  SiSWAP: "siswap",
  SiSWAPDG: "siswap_dagger",
  FSWAP: "fswap",
  fSim: "fsim",
  SYC: "syc",
  GeneralizedfSim: "gfsim",
  RXX: "rxx",
  RYY: "ryy",
  RZZ: "rzz",
  RZX: "rzx",
  RXXYY: "rxxyy",
  MS: "ms",
  GIVENS: "givens",
  RBS: "rbs",
  ECR: "ecr",

  // Multi Qubit Gates
  TOFFOLI: "ccx",
  CCZ: "ccz",
  DEUTSCH: "deutsch",
  GeneralizedRBS: "grbs",

  // Special Gates
  Unitary: "unitary",
  Align: "align",
  M: "measure",
};

// Reverse mapping (name to class)
const QIBO_NAME_TO_CLASS = Object.fromEntries(
  Object.entries(QIBO_GATE_MAPPING).map(([key, value]) => [value, key])
);

// QuICScript Gate Mappings
const QUIC_TO_QIBO_CLASS = {
  // Basic Gates
  X: "X",
  Y: "Y",
  Z: "Z",
  H: "H",
  P: "S", // Phase gate = S gate in Qibo (confirmed)
  T: "T",
  N: "X", // NOT gate = X gate in Qibo (corrected)
  U: "U3", // Your U gate = Qibo U3 gate
  s: "SWAP", // Your s gate = Qibo SWAP gate
  // Both measurement gates (single and multi shot) are the same character in Qibo
  m: "M",
  M: "M",

  // Rotation Gates (lowercase in your language)
  x: "RX", // Your rotation x = Qibo RX
  y: "RY", // Your rotation y = Qibo RY
  z: "RZ", // Your rotation z = Qibo RZ

  // Control Gate (special handling needed)
  C: "CONTROLLED_PREFIX", // Special marker for controlled gates
};

// Reverse mapping (Qibo class to your QuICScript)
const QIBO_CLASS_TO_QUIC = Object.fromEntries(
  Object.entries(QUIC_TO_QIBO_CLASS).map(([key, value]) => [value, key])
);

// QuICScript to QASM Name (via Qibo)
const QUIC_TO_QASM = {};
Object.entries(QUIC_TO_QIBO_CLASS).forEach(([yourGate, qiboClass]) => {
  if (qiboClass !== "CONTROLLED_PREFIX") {
    QUIC_TO_QASM[yourGate] = QIBO_GATE_MAPPING[qiboClass];
  }
});

// Gate Categories from QuICScript (corrected)
const QUIC_GATES = {
  rGates: ["x", "y", "z"],
  controlledGates: ["X", "Y", "Z", "P", "T", "N", "s", "U", "H", "x", "y", "z"],
  controlledGatesWithC: [
    "X",
    "Y",
    "Z",
    "P",
    "T",
    "N",
    "s",
    "U",
    "H",
    "x",
    "y",
    "z",
    "C",
  ],

  // Additional categorization
  singleQubitGates: ["X", "Y", "Z", "P", "T", "N", "H", "x", "y", "z", "U"],
  twoQubitGates: ["s"], // SWAP gate
  parameterizedGates: ["x", "y", "z", "U"], // Gates that need angle parameters

  // All possible controlled gate combinations
  allControlledVariants: [
    "CX",
    "CY",
    "CZ",
    "CP",
    "CT",
    "CN",
    "CH",
    "CU",
    "Cs",
    "Cx",
    "Cy",
    "Cz", // Lowercase rotation gates
  ],
};

// Helper functions
export function getGateName(gateClass) {
  return QIBO_GATE_MAPPING[gateClass] || null;
}

export function getGateClass(gateName) {
  return QIBO_NAME_TO_CLASS[gateName] || null;
}

// New helper functions for QuICScript
export function quicToQiboClass(yourGate) {
  return QUIC_TO_QIBO_CLASS[yourGate] || null;
}

export function qiboClassToQuic(qiboClass) {
  return QIBO_CLASS_TO_QUIC[qiboClass] || null;
}

export function quicToQasmName(yourGate) {
  return QUIC_TO_QASM[yourGate] || null;
}

// Handle controlled gates from QuICScript
export function parseControlledGate(gateString) {
  // Strip all "C" prefixes to get the base gate
  const baseGate = gateString.replace(/^C+/, "");
  const baseQiboClass = quicToQiboClass(baseGate);
  const qasmName = quicToQasmName(baseGate);

  return {
    baseQiboClass,
    qasmName,
    parameterized: ["x", "y", "z", "U"].includes(baseGate),
  };
}

// Pattern matching function for finding controlled gates in circuit strings
function findControlledGatesPattern(circuitString) {
  // Regex to match C followed by any of your gate characters
  const controlledGateRegex = /C[XYZPTNHsUxyz]/g;
  const matches = circuitString.match(controlledGateRegex) || [];

  // Define which controlled gates Qibo actually supports
  const QIBO_SUPPORTED_CONTROLLED = new Set([
    "CX", // CNOT - widely supported
    "CY", // Controlled-Y - supported
    "CZ", // Controlled-Z - widely supported
    "CN", // Controlled-NOT (same as CX) - supported
    "CP", // Controlled-Phase (CS) - supported
    "CT", // Controlled-T - supported
    "Cx", // Controlled-RX - supported
    "Cy", // Controlled-RY - supported
    "Cz", // Controlled-RZ - supported
    "CU", // Controlled-U3 - supported
  ]);

  // Gates that Qibo doesn't support as controlled variants
  const QIBO_UNSUPPORTED_CONTROLLED = new Set([
    "CH", // Controlled-Hadamard - not natively supported in Qibo
    "Cs", // Controlled-SWAP (CSWAP/Fredkin) - NOT found in Qibo documentation
  ]);

  const results = {
    supported: [],
    unsupported: [],
    errors: [],
  };

  matches.forEach((match) => {
    const position = circuitString.indexOf(match);
    const parsed = parseControlledGate(match);

    const gateInfo = {
      match: match,
      position: position,
      parsed: parsed,
    };

    if (QIBO_SUPPORTED_CONTROLLED.has(match)) {
      results.supported.push(gateInfo);
    } else if (QIBO_UNSUPPORTED_CONTROLLED.has(match)) {
      const error = {
        ...gateInfo,
        error: `Controlled gate '${match}' is not natively supported by Qibo`,
        suggestion: `Consider decomposing '${match}' into supported gates or using a custom implementation`,
        baseGate: match.substring(1),
      };
      results.unsupported.push(error);
      results.errors.push(error.error);
    } else {
      // Unknown controlled gate pattern
      const error = {
        ...gateInfo,
        error: `Unknown controlled gate pattern '${match}'`,
        suggestion: `Verify that '${match.substring(
          1
        )}' is a valid base gate in your circuit language`,
      };
      results.unsupported.push(error);
      results.errors.push(error.error);
    }
  });

  return results;
}

// Enhanced validation function specifically for controlled gates
function validateControlledGates(circuitString) {
  const results = findControlledGatesPattern(circuitString);

  const validation = {
    isValid: results.errors.length === 0,
    supportedCount: results.supported.length,
    unsupportedCount: results.unsupported.length,
    errors: results.errors,
    warnings: [],
    suggestions: [],
  };

  // Add specific warnings and suggestions
  results.unsupported.forEach((unsupported) => {
    if (unsupported.match === "CH") {
      validation.warnings.push(
        "Controlled-Hadamard (CH) can be implemented using H-CZ-H decomposition"
      );
      validation.suggestions.push(
        `Replace 'CH' with the sequence: H(target) → CZ(control,target) → H(target)`
      );
    } else if (unsupported.match === "Cs") {
      validation.warnings.push(
        "Controlled-SWAP (Cs/CSWAP/Fredkin) is not natively supported in Qibo"
      );
      validation.suggestions.push(
        `Replace 'Cs' with Toffoli-based decomposition or implement as custom gate`
      );
    }
  });

  return validation;
}

// Helper function to suggest decompositions for unsupported controlled gates
function suggestDecomposition(controlledGate) {
  const decompositions = {
    CH: {
      description: "Controlled-Hadamard decomposition",
      sequence: ["H(target)", "CZ(control,target)", "H(target)"],
      qiboGates: ["H", "CZ", "H"],
      explanation:
        "Controlled-H can be decomposed using the identity: CH = H⊗I · CZ · H⊗I",
    },
    Cs: {
      description: "Controlled-SWAP (Fredkin gate) decomposition",
      sequence: [
        "CNOT(control,target1)",
        "TOFFOLI(control,target2,target1)",
        "CNOT(control,target1)",
      ],
      qiboGates: ["CNOT", "TOFFOLI", "CNOT"],
      explanation:
        "Controlled-SWAP can be implemented using CNOT and Toffoli gates",
    },
    // Add more decompositions as needed
  };

  return decompositions[controlledGate] || null;
}

// Example usage and testing
const validationExamples = {
  // Valid circuit with supported controlled gates
  validCircuit: "H-CX-Cy-CP-Cz",

  // Invalid circuit with unsupported controlled gates
  invalidCircuit: "H-CH-CX-Cs-UnknownGate",

  // Test the validation
  testValidation: function () {
    console.log("=== Testing Valid Circuit ===");
    const validResults = validateControlledGates(this.validCircuit);
    console.log("Valid:", validResults.isValid);
    console.log("Supported gates:", validResults.supportedCount);
    console.log("Errors:", validResults.errors);

    console.log("\n=== Testing Invalid Circuit ===");
    const invalidResults = validateControlledGates(this.invalidCircuit);
    console.log("Valid:", invalidResults.isValid);
    console.log("Unsupported gates:", invalidResults.unsupportedCount);
    console.log("Errors:", invalidResults.errors);
    console.log("Warnings:", invalidResults.warnings);
    console.log("Suggestions:", invalidResults.suggestions);

    console.log("\n=== Decomposition Suggestion ===");
    const chDecomposition = suggestDecomposition("CH");
    console.log("CH decomposition:", chDecomposition);
  },
};

// Example conversions (corrected)
const conversionExamples = {
  // Basic gates
  N: {
    yourGate: "N",
    qiboClass: "X", // NOT = X gate (corrected)
    qasmName: "x",
  },
  P: {
    yourGate: "P",
    qiboClass: "S", // Phase = S gate (confirmed)
    qasmName: "s",
  },

  // Your rotation gates
  x: {
    yourGate: "x",
    qiboClass: "RX",
    qasmName: "rx",
  },
  y: {
    yourGate: "y",
    qiboClass: "RY",
    qasmName: "ry",
  },
  z: {
    yourGate: "z",
    qiboClass: "RZ",
    qasmName: "rz",
  },

  // Your special gates
  U: {
    yourGate: "U",
    qiboClass: "U3",
    qasmName: "u3",
  },
  s: {
    yourGate: "s",
    qiboClass: "SWAP",
    qasmName: "swap",
  },

  // Controlled gates examples (corrected)
  CX: {
    yourGate: "CX",
    baseGate: "X",
    qiboClass: "CNOT", // CX = CNOT (most common)
    qasmName: "cx",
    controlled: true,
  },
  CN: {
    yourGate: "CN",
    baseGate: "N", // N = NOT = X gate
    qiboClass: "CNOT", // CN = C + NOT = CNOT
    qasmName: "cx",
    controlled: true,
  },
  Cx: {
    yourGate: "Cx",
    baseGate: "x", // rotation x
    qiboClass: "CRX",
    qasmName: "crx",
    controlled: true,
    parameterized: true,
  },
  CP: {
    yourGate: "CP",
    baseGate: "P", // P = Phase = S gate
    qiboClass: "CS", // Controlled-S
    qasmName: "cs",
    controlled: true,
  },
};

// Bell State Circuit Example (using your circuit language)
const bellStateGatesYourLanguage = [
  {
    yourGate: "H",
    qiboClass: quicToQiboClass("H"), // "H"
    qasmName: quicToQasmName("H"), // "h"
    gateInfo: parseControlledGate("H"),
  },
  {
    yourGate: "CX", // Controlled X = CNOT in your language
    qiboClass: parseControlledGate("CX").controlledQiboClass, // "CNOT"
    qasmName: parseControlledGate("CX").qasmName, // "cx"
    gateInfo: parseControlledGate("CX"),
  },
];

// Export for use
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    // Original Qibo mappings
    QIBO_GATE_MAPPING,
    QIBO_NAME_TO_CLASS,
    getGateName,
    getGateClass,

    // Your circuit language mappings
    QUIC_TO_QIBO_CLASS,
    QIBO_CLASS_TO_QUIC,
    QUIC_TO_QASM,
    QUIC_GATES,

    // Helper functions for your circuit language
    quicToQiboClass,
    qiboClassToQuic,
    quicToQasmName,
    parseControlledGate,

    // Enhanced pattern matching and validation
    findControlledGatesPattern,
    validateControlledGates,
    suggestDecomposition,

    // Examples and testing
    validationExamples,
    conversionExamples,
    bellStateGatesYourLanguage,
  };
}
