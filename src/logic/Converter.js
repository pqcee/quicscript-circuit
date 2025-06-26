import { quicDelimiterRemoval } from "./Helper";

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
