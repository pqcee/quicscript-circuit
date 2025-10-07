import { Gates } from "./Gates";

import { findOptimalCompression, processGates } from "./FileHelper";
import {
  controlledGates,
  delimiter,
  parametricGates,
  quicDelimiterRemoval,
  rGates,
} from "./Helper";
import {
  getGateName,
  parseControlledGate,
  quicToQasmName,
  quicToQiboClass,
} from "./QiboMapping.js";

/**
 * Reference: https://www.geeksforgeeks.org/how-to-declare-two-dimensional-empty-array-in-javascript/
 * @param {number} rows
 * @param {number} cols
 * @returns
 */
export function createEmpty2DArray(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

/**
 *
 * @param {string[][]} arrayIn
 */
export function rowsToColumns(arrayIn) {
  if (arrayIn.length == 0) return [];
  return createEmpty2DArray(arrayIn[0].length, arrayIn.length).map((row, i) =>
    row.map((col, y) => arrayIn[y][i])
  );
}

/**
 * Convert Array which indexed by Qubit to Gates to Qulc
 * @param {string[][]} arrayIn
 */
export function convertArrayToString(data) {
  const array = data;
  const numberOfColumn = array[0].length;
  const numberOfQubits = array.length;

  const stringArray = createEmpty2DArray(numberOfColumn, numberOfQubits);
  const numberOfGatePerColumn = new Array(numberOfColumn).fill(0);
  let maxColumn = 0;

  array.forEach((a, i) => {
    a.forEach((gate, y) => {
      if (gate != "") {
        numberOfGatePerColumn[y] = i + 1;
        stringArray[y][i] = gate;
        if (y > maxColumn) maxColumn = y;
      } else {
        stringArray[y][i] = "I";
      }
    });
  });

  maxColumn = maxColumn + 1; // Index start from 0

  const maxQubits = Math.max(...numberOfGatePerColumn);

  const finalArray = [];
  for (let y = 0; y < maxColumn; y++) {
    let str = "";
    for (let i = 0; i < maxQubits; i++) str = str.concat(stringArray[y][i]);
    finalArray.push(str);
  }
  return finalArray.join(",");
}

/**
 * Assume split string to be same length
 * @param {string} circuit
 */
export function convertStringToArray(circuit) {
  circuit = quicDelimiterRemoval(circuit);
  const splitString = circuit.split(",");
  const qubits = splitString[0].length;
  const columns = splitString.length;
  const arr = createEmpty2DArray(qubits, columns).map((ar, i) =>
    ar.map((_, y) => splitString[y][i])
  );
  return arr;
}

/**
 * Convert QuICScript file text to quicstring
 */
export const convertFileToString = (content) => {
  const lines = content.split("\n");
  const circuit = lines.slice(1);

  // Join all lines into a single string
  let combined = circuit.join("");

  // Process the {L ...} format
  combined = combined.replace(
    /\{L\s+(\d+)\s*([^}]+)\}/g,
    (match, number, str, offset, fullString) => {
      // Remove trailing comma from the string inside {}
      const cleanStr = str.replace(/,$/, "");
      // Repeat the string the specified amount of times
      const expanded = Array.from(
        { length: parseInt(number) },
        () => cleanStr
      ).join(",");

      // Check what comes after this match in the full string
      const afterMatch = fullString.substring(offset + match.length);

      // If there's content after and it doesn't start with a comma, add one
      if (afterMatch.length > 0 && !afterMatch.startsWith(",")) {
        return expanded + ",";
      }

      return expanded;
    }
  );

  // Process the {U ...} format
  combined = combined.replace(
    /(.*?)U(.*?),\{U\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\}/g,
    (_match, prefix, suffix, theta, phi, lambda) => {
      // Replace U with U{theta,phi,lambda} and keep the rest
      return `${prefix}U{${theta}|${phi}|${lambda}}${suffix},`;
    }
  );

  // Process the {R ...} format
  combined = combined.replace(
    /(.*?)([xyz])(.*?),\{R\s+([\d.-]+)\}/g,
    (_match, prefix, gate, suffix, alpha) => {
      // Replace R with [x/y/z]{alpha} and keep the rest
      return `${prefix}${gate}{${alpha}}${suffix},`;
    }
  );

  // Clean up any double commas that might be created
  combined = combined.replace(/,,+/g, ",");

  // Remove trailing comma at the very end if it exists
  combined = combined.replace(/,$/, "");

  return combined;
};

/**
 * Convert quicstring to QuICScript file format
 */
export const convertStringToFile = (quicstring, gates) => {
  // Compress repeated patterns into {L number pattern} format
  const compressed = !(
    quicstring.includes("U") && rGates.some((gate) => quicstring.includes(gate))
  )
    ? findOptimalCompression(quicstring)
    : quicstring.split(",");

  const processedSegments = processGates(compressed, gates);

  // Add header line and join with newlines, adding commas appropriately
  const header = "# QUICSCRIPT CIRCUIT"; // TODO: Customize this in the future

  // Add commas to all lines except the last
  const formattedSegments = processedSegments.map((segment, index) => {
    if (index === processedSegments.length - 1 || segment.slice(-1) === "}") {
      return segment; // No comma for last segment and any segment with special operators (encapsulated by {})
    } else {
      return segment + ","; // Add comma for middle segments
    }
  });

  return header + "\n" + formattedSegments.join("\n");
};

/**
 * Convert quicstring to QIBO json format
 * @param {string} quicstring - QuICScript circuit string
 * @param {Gates} gates - Gates service class object
 * @param {Array} allowedGates - Array of allowed QuICScript gates
 */
export const convertStringToQibo = (quicstring, gates, allowedGates) => {
  // Remove delimiter (if it exists)
  if (delimiter.some((delim) => delim === quicstring.slice(-1))) {
    quicstring = quicstring.slice(0, -1);
  }

  // Split quicstring into columns
  const columns = quicstring.split(",");

  // Calculate number of qubits
  const numberOfQubits = columns[0].length;

  // Container for the queue of qibo circuit operations
  const qiboQueue = [];

  // Loop through the columns and convert each column into a series of
  // operations, to be added to qiboQueue.
  // qiboQueue will then be added to queue in qiboObj, which makes up the json.
  for (const columnIndex in columns) {
    let column = columns[columnIndex];
    const isControlledColumn = column.includes("C");

    // Remove all delete operators as they are not supported by Qibo
    if (allowedGates.includes("d")) {
      column = column.replaceAll("d", "");
    }

    // Collate all the gates in each column into an array
    let gatesArray = [];
    column.split("").map((gate, index) => {
      // Ignore identity gates
      if (gate === "I") {
        return;
      }

      // Push the gate character and qubit it's on into a gates array.
      // Used for uncontrolled gate parsing in each column.
      gatesArray.push({ gate, qubit: index });
    });

    // Only parse each gate individually if the column
    // is not controlled
    if (!isControlledColumn) {
      // Iterate through the gatesArray and push
      // the corresponding gates into the QIBO queue
      for (const gateObj of gatesArray) {
        const { gate, qubit } = gateObj;
        const qiboClass = quicToQiboClass(gate);
        const qiboName = quicToQasmName(gate);

        const isParametricGate = parametricGates.includes(gate);

        // Only add to queue if Qibo class and name are both not null
        if (qiboClass && qiboName) {
          if (!isParametricGate) {
            qiboQueue.push({
              _class: qiboClass,
              name: qiboName,
              init_args: [qubit],
              init_kwargs: {},
              _target_qubits: [qubit],
              _control_qubits: [],
            });
          } else if (rGates.includes(gate)) {
            const rGateValue = gates.getRGateValue(columnIndex, gate);
            qiboQueue.push({
              _class: qiboClass,
              name: qiboName,
              init_args: [qubit],
              init_kwargs: { theta: rGateValue },
              _target_qubits: [qubit],
              _control_qubits: [],
            });
          } else if (gate === "U") {
            const { theta, phi, lambda } =
              gates.getUGateColumnValue(columnIndex);
            qiboQueue.push({
              _class: qiboClass,
              name: qiboName,
              init_args: [qubit],
              init_kwargs: {
                theta: theta,
                phi: phi,
                lam: lambda,
              },
              _target_qubits: [qubit],
              _control_qubits: [],
            });
          } else if (gate === "m" || gate === "M") {
            qiboQueue.push({
              _class: qiboClass,
              name: qiboName,
              init_args: [qubit],
              init_kwargs: {
                register_name: null,
                collapse: false,
                basis: ["Z"],
                p0: null,
                p1: null,
              },
              _target_qubits: [qubit],
              _control_qubits: [],
              measurement_result: {
                samples: null,
              },
            });
          }
        }
      }
    } else {
      // Assume that the entire column is a single controlled gate
      let controlledGate = column.replaceAll("I", "");

      // If NOT gate(s) in column, replace all instances with X gate
      // with _control_qubits array for control gates.
      // This is because CNOT gate import will result in an error,
      // because _control_qubit will result in CNOT gate having a
      // controlled_by call chained on to it, when imported into Qibo
      // E.g. [Qibo 0.2.21|ERROR|2025-09-30 18:35:23]: Cannot use `controlled_by` method on gate <qibo.gates.gates.CNOT object at 0x786fa8dfc9e0> because it is already controlled by (0,).
      if (controlledGate.includes("N")) {
        controlledGate = controlledGate.replaceAll("N", "X");
      }

      // Parse the controlled gate
      const parsedGate = parseControlledGate(controlledGate);

      // Get the qubits that are controlled
      const controlledQubits = [...column]
        .map((char, i) => (char === "C" ? i : -1))
        .filter((i) => i !== -1);

      // Get the qubits that are targets
      const targetQubits = [...column]
        .map((char, i) => (!["I", "C"].includes(char) ? i : -1))
        .filter((i) => i !== -1);

      // Get keyword params if controlledGate is a R gate or U gate
      let keywordParams = {};
      const baseGate = controlledGate.substring(1);

      if (rGates.includes(baseGate)) {
        keywordParams["theta"] = gates.getRGateValue(columnIndex, baseGate);
      } else if (baseGate === "U") {
        const { theta, phi, lambda } = gates.getUGateColumnValue(columnIndex);
        keywordParams = {
          theta,
          phi,
          lambda,
        };
      }

      // Measurement gate is not included here as it is not a controlled gate.

      // If the controlled gate is supported (not null), add it
      // to the Qibo queue
      if (parsedGate.baseQiboClass) {
        qiboQueue.push({
          _class: parsedGate.baseQiboClass,
          name: parsedGate.qasmName,
          init_args: targetQubits,
          init_kwargs: keywordParams,
          _target_qubits: targetQubits,
          _control_qubits: controlledQubits,
        });
      }
    }
  }

  // Prepare QIBO object
  const qiboObj = {
    queue: qiboQueue,
    nqubits: numberOfQubits,
    density_matrix: false,
    wire_names: null,
    qibo_version: "0.2.21",
  };

  // Stringify QIBO object (obj, replacer_fn, indentation)
  const qiboJson = JSON.stringify(qiboObj, null, 2);

  console.log(qiboJson);

  return qiboJson;
};
