import { COPY, MOVE } from "../components/builder/Selector.jsx";
import GateModel from "../models/GateModel.js";
import {
  parseSegmentIntoGates,
  quicDelimiterRemoval,
  rGates,
} from "./Helper.js";
import { Quic } from "./Quic.js";
import { Selector } from "./Selector.js";
import { updateGateSlots } from "../store/circuitSlice.js";

// Special Methods
export const ADDCOLUMNRIGHTAT = "AddColumnRightAt";
export const DELETECOLUMNAT = "DeleteColumnAt";
export const MOVESELECTOR = "Move Selector";
export const COPYSELECTOR = "Copy Selector";
export { COPY, MOVE };

export const maxQubits = 20;

export class Gates {
  // When these properties are initialized outside of constructors,
  // they are read-only properties. If there is any variable you wish
  // to not be read-only, please initialize them in the constructor.
  observers = [];
  draggingGate = new GateModel(null, null, null);
  qubits = 1;
  columns = 1;
  uHolder = {};
  rHolder = {};
  selector = null; // Initailize in constructor
  dispatch = null; // Redux dispatch function
  defaultConfig = null;

  constructor(
    qubits,
    columns,
    quic = "",
    dynamicConfig = null,
    dispatch = null
  ) {
    // Store redux dispatch
    this.dispatch = dispatch;

    // Initial Class
    this.selector = new Selector();

    // Use passed config or fallback to imported default
    this.defaultConfig = dynamicConfig?.defaultCircuit;

    if (quic != null && quic !== "") {
      const quicObj = new Quic(
        quic,
        Object.values(dynamicConfig?.availableGates || {}).flat()
      ).validate();

      if (quicObj) {
        // Case 1 & 2: Quic is valid
        this.qubits = quicObj.qubits;
        this.columns = quicObj.columns;
        // Case 2: Valid Qubits or Columns
        if (!!qubits && qubits > quicObj.qubits) this.qubits = qubits;
        if (!!columns && columns > quicObj.columns) this.columns = columns;
      } else {
        //TODO: Let user know quic is invalid
        quic = "";
      }
    } else {
      if (!qubits && !columns) {
        /**
         *  Case 3: Use Default
         *  Variable: quic null, qubits NaN, columns NaN
         */
        this.qubits = this.defaultConfig.qubits || 1;
        this.columns = this.defaultConfig.columns || 1;
      } else {
        /**
         *  Case 4: Use Fixed qubits/columns
         *  Variable: quic null, qubits || columns
         */
        if (!!qubits && qubits > 0) this.qubits = qubits;
        if (!!columns && columns > 0) this.columns = columns;
      }
    }

    // Qubits limiter
    if (this.qubits > maxQubits) {
      console.error(
        `Config Error: Setting qubit of ${this.qubits} is greater than maxQubits of ${maxQubits}\nDefaulting to maxQubits`
      );
      this.qubits = maxQubits;
    }

    this.gateSlots = new Array(this.qubits)
      .fill([])
      .map((_) => new Array(this.columns).fill(""));

    this.updateWithQuicscript(quic);
  }

  // Dispatch to Redux instead of notifying observers
  emitChange() {
    if (this.dispatch) {
      this.dispatch(
        updateGateSlots({
          gateSlots: JSON.parse(JSON.stringify(this.gateSlots)),
          parameters: {
            // Doing a deep clone is to ensure that Redux receives an independent copy of the object.
            // If you pass a shallow spread (i.e. { ...this.rHolder }), the reference in Redux
            // will be shared by the original object in this class. Hence, when mutations
            // are made to this object in this class, they will fail, as any object passed to
            // Redux must pass immutability check which will freeze the reference.
            // This will result in the following error:
            // can't define property "x": Object is not extensible
            uHolder: this.deepClone(this.uHolder),
            rHolder: this.deepClone(this.rHolder),
          },
          updateText: false, // NEVER auto-update text from Gates class
          source: "visual",
        })
      );
    }
  }

  // Convert current state to simple QuICScript for text input
  toSimpleQuicscript() {
    return this.gateSlots
      .map((row) => {
        return row.map((gate) => gate || "I").join("");
      })
      .join(",");
  }

  // addQubit and deleteQubit need emitChange calls because they are not connected to UI state
  addQubit() {
    this.gateSlots.push(new Array(this.columns).fill(""));
    this.qubits++;
    this.emitChange();
  }

  deleteQubit(qubit) {
    if (this.qubits == 1) {
      this.gateSlots[0] = new Array(this.columns).fill("");
    } else {
      this.gateSlots.splice(qubit, 1);
      this.qubits--;
    }
    this.emitChange();
  }

  // On the other hand, addMultipleQubits and deleteMultipleQubits don't need to emit changes,
  // as they are triggered in updateWithQuicscript method which is typically called from
  // button handlers that trigger state updates.
  addMultipleQubits(qubits) {
    for (let i = 0; i < qubits; i++) {
      this.gateSlots.push(new Array(this.columns).fill(""));
      this.qubits++;
    }
  }

  deleteMultipleQubits(qubits) {
    this.gateSlots.splice(0, qubits);
    this.qubits = this.qubits - qubits;
  }

  /**
   * Add one column at the right of specified column
   * @param {number} column
   */
  addColumnAt(column) {
    this.gateSlots = this.gateSlots.map((a) => {
      a.splice(column, 0, "");
      return a;
    });
    this.columns++;
    this.emitChange();
  }

  /**
   * Add one column to the left
   */
  addColumn() {
    this.addMultipleColumns(1);
  }

  /**
   * Add Multiple Columns
   * @param {number} n
   */
  addMultipleColumns(n) {
    this.gateSlots.forEach((a) => a.push(...new Array(n).fill("")));
    this.columns = this.columns + n;
  }

  /**
   * Remove Multiple Columns
   * @param {number} n
   */
  removeMultipleColumns(n) {
    this.gateSlots.map((qubitRow) => qubitRow.splice(-n));
    this.columns = this.columns - n;
  }

  /**
   * Delete column at specified index
   */
  deleteColumnAt(column) {
    // One Column left
    if (this.columns == 1) {
      this.gateSlots.forEach((a) => (a[0] = "")); // Clear Column
    } else {
      this.gateSlots = this.gateSlots.map((a) => {
        a.splice(column, 1);
        return a;
      });
      this.columns--;
    }
    this.emitChange();
  }

  clearCircuit() {
    this.gateSlots = this.gateSlots.map((a) => a.map((_) => ""));
    this.uHolder = {};
    this.emitChange();
  }

  setDraggingGate(gate) {
    this.draggingGate = gate;
  }

  moveGate(toQubit, toColumn) {
    const { qubit, column, name } = this.draggingGate;
    if (this.isSpecialMethod())
      return this.handleSpecialMethod(name, toQubit, toColumn);
    if (toQubit == qubit && toColumn == column) return;

    this.gateSlots[toQubit][toColumn] = name;
    if (qubit != null && column != null) {
      this.gateSlots[qubit][column] = "";
    }

    /** If this.draggingGate is U gate, move state */
    if (name == "U" && toColumn != column) {
      this.moveUGateValue(column, toColumn);
    }

    /** If this.draggingGate is Rx, Ry, or Rz gate, move state */
    if (rGates.includes(name) && toColumn != column) {
      this.moveRGateValue(column, toColumn);
    }

    this.emitChange(); // Update text after visual change
  }

  /**
   * Check if draggingGate is a special method
   * @returns {boolean|string}
   * Return name of special method if draggingGate is a special method, else false
   */
  isSpecialMethod() {
    return this.draggingGate.name.length > 1 ? this.draggingGate.name : false;
  }

  /** Deletes Gates from gateSlots */
  deleteGate() {
    const { qubit, column, name } = this.draggingGate;
    if (!!this.gateSlots[qubit]) {
      this.gateSlots[qubit][column] = "";
      if (name == "U" && !!column) this.deleteUGate(column);
      if (rGates.includes(name) && !!column) this.deleteRGate(column, name);
      this.emitChange(); // Update text after deletion
    }
  }

  canMoveGate(toQubit, toColumn) {
    // const [qubit, column] = this.gatePosition;
    // const dx = toQubit - qubit;
    // const dy = toColumn - column;
    return true;
  }

  // Deep clone helper for nested objects
  deepClone = (obj) => {
    if (!obj) return {};
    const cloned = {};
    for (const key in obj) {
      cloned[key] = { ...obj[key] };
    }
    return cloned;
  };

  updateWithQuicscript(quicscript, preserveExistingParams = true) {
    // CRITICAL: Prevent redundant processing
    if (this._lastQuicscript === quicscript) {
      return;
    }
    this._lastQuicscript = quicscript;

    if (quicscript != "" && (!quicscript || quicscript.length == 0)) return; // Empty or Null quic

    // Store existing parameters before processing
    const existingUHolder = preserveExistingParams ? { ...this.uHolder } : {};
    const existingRHolder = preserveExistingParams ? { ...this.rHolder } : {};

    // Retrieve the QuIC array
    const quicArr = quicDelimiterRemoval(quicscript).split(",");

    // Get number of columns
    const numberOfQuicCols = quicArr.length;
    const defaultNumberOfCols = this.defaultConfig.columns || 9;
    const currentNumberOfCols = this.columns;

    // Get target number of columns
    const targetNumberOfCols = Math.max(numberOfQuicCols, defaultNumberOfCols);

    // Add more columns if target number of columns are more than current number of columns
    if (targetNumberOfCols > currentNumberOfCols) {
      const columnsToAdd = targetNumberOfCols - currentNumberOfCols;
      this.addMultipleColumns(columnsToAdd);
    }

    // Remove excess columns if current number of columns are more than the target number of columns
    else if (targetNumberOfCols < currentNumberOfCols) {
      const columnsToRemove = currentNumberOfCols - targetNumberOfCols;
      this.removeMultipleColumns(columnsToRemove);
    }

    // Get number of rows
    const noOfRows = quicArr[0].length;
    const defaultNumberOfRows = this.defaultConfig.qubits || 9;
    const currentNumberOfRows = this.qubits;

    // Get target number of rows
    const targetNumberOfRows = Math.max(noOfRows, defaultNumberOfRows);

    // Add more rows if target number of rows are more than the current number of rows
    if (targetNumberOfRows > currentNumberOfRows) {
      const rowsToAdd = targetNumberOfRows - currentNumberOfRows;
      this.addMultipleQubits(rowsToAdd);
    }

    // Remove excess rows if current number of rows are more than the target number of rows
    else if (targetNumberOfRows < currentNumberOfRows) {
      const rowsToRemove = currentNumberOfRows - targetNumberOfRows;
      this.deleteMultipleQubits(rowsToRemove);
    }

    // Update gate slots with parameter preservation
    this.gateSlots = this.gateSlots.map((row, rowIndex) => {
      return row.map((_, columnIndex) => {
        if (quicArr.length > columnIndex && noOfRows > rowIndex) {
          const columnGates = parseSegmentIntoGates(quicArr[columnIndex]);

          if (columnGates[rowIndex]?.[0] === "U") {
            const uGatePattern = /^U\{([\d.-]+)\|([\d.-]+)\|([\d.-]+)\}$/;
            const match = columnGates[rowIndex].match(uGatePattern);

            if (match) {
              // Input has parameters - use them
              const [_, theta, phi, lambda] = match;
              this.setAllUGateValue({ theta, phi, lambda }, columnIndex);
            } else if (existingUHolder[columnIndex]) {
              // Input has no parameters but we have existing ones - preserve them
              this.uHolder[columnIndex] = existingUHolder[columnIndex];
            }
            return "U";
          } else if (rGates.includes(columnGates[rowIndex]?.[0])) {
            const rGatePattern = /^([xyz])\{([\d.-]+)\}$/;
            const match = columnGates[rowIndex].match(rGatePattern);

            if (match) {
              // Input has parameters - use them
              const [_, rGateType, alpha] = match;
              this.setRGateValue(columnIndex, rGateType, parseFloat(alpha));
            } else if (
              existingRHolder[columnIndex]?.[columnGates[rowIndex]?.[0]]
            ) {
              // Input has no parameters but we have existing ones - preserve them
              if (!this.rHolder[columnIndex]) {
                this.rHolder[columnIndex] = {};
              }
              this.rHolder[columnIndex][columnGates[rowIndex]?.[0]] =
                existingRHolder[columnIndex][columnGates[rowIndex]?.[0]];
            }
            return columnGates[rowIndex]?.[0];
          } else if (columnGates[rowIndex] === "I") {
            return "";
          } else {
            return columnGates[rowIndex];
          }
        }
        return "";
      });
    });

    // Only emit visual update when processing text input
    this.emitChange();
  }

  ifColumnHasGate(column, gate) {
    return this.gateSlots.some((gates) => gates[column] == gate);
  }

  deleteRGate(column, type) {
    if (!this.ifColumnHasGate(column, type)) this.rHolder[column] = null;
  }

  moveRGateValue(column, toColumn, type) {
    if (column != null && toColumn != null) {
      if (!this.rHolder[toColumn])
        this.rHolder[toColumn] = { ...this.rHolder[column] };
      if (!this.ifColumnHasGate(column, type)) this.rHolder[column] = null;
    }
  }

  setRGateValue(column, type, value) {
    if (!this.rHolder[column]) this.rHolder[column] = {};
    this.rHolder[column][type] = value;
  }

  getRGateValue(column, type) {
    if (!this.rHolder[column]) this.rHolder[column] = {};
    return this.rHolder[column][type] ? this.rHolder[column][type] : 0;
  }

  deleteUGate(column) {
    if (!this.ifColumnHasGate(column, "U")) this.uHolder[column] = null;
  }

  moveUGateValue(column, toColumn) {
    if (column != null && toColumn != null) {
      if (!this.uHolder[toColumn])
        this.uHolder[toColumn] = { ...this.uHolder[column] };
      if (!this.ifColumnHasGate(column, "U")) this.uHolder[column] = null;
    }
  }

  setUGateValue(column, angle, value) {
    if (!this.uHolder[column]) this.uHolder[column] = {};
    this.uHolder[column][angle] = value;
  }

  getUGateValue(column, angle) {
    if (!this.uHolder[column]) this.uHolder[column] = {};
    return this.uHolder[column][angle] ? this.uHolder[column][angle] : 0;
  }

  getUGateColumnValue(column) {
    // const angles = ["ϴ", "φ", "λ"];
    if (this.uHolder[column]) {
      const theta = parseFloat(this.uHolder[column]["ϴ"]);
      const phi = parseFloat(this.uHolder[column]["φ"]);
      const lambda = parseFloat(this.uHolder[column]["λ"]);
      return {
        theta: theta ? theta : 0,
        phi: phi ? phi : 0,
        lambda: lambda ? lambda : 0,
      };
    }
    return { theta: 0, phi: 0, lambda: 0 };
  }

  setAllUGateValue({ theta, phi, lambda }, column) {
    this.uHolder[column] = {};
    this.uHolder[column]["ϴ"] = theta;
    this.uHolder[column]["φ"] = phi;
    this.uHolder[column]["λ"] = lambda;
  }

  handleSpecialMethod(name, toQubit, toColumn) {
    switch (name) {
      case ADDCOLUMNRIGHTAT:
        this.addColumnAt(toColumn + 1);
        return;
      case DELETECOLUMNAT:
        this.deleteColumnAt(toColumn);
        return;
      case MOVESELECTOR:
        return this.selector.trigger(toQubit, toColumn, MOVE);
      case COPYSELECTOR:
        return this.selector.trigger(toQubit, toColumn, COPY);
      case MOVE:
        this.selector.removeSelectedArea(
          this,
          this.gateSlots,
          (uGateColumns) => {
            this.selector.copySelectedArea(
              this,
              this.gateSlots,
              toQubit,
              toColumn,
              uGateColumns,
              () => {
                this.selector.clear();
                this.emitChange();
              }
            );
          }
        );
        return;
      case COPY:
        const uGateColumns = this.selector.getSelectedUGateColumns(
          this,
          this.gateSlots
        );
        this.selector.copySelectedArea(
          this,
          this.gateSlots,
          toQubit,
          toColumn,
          uGateColumns,
          () => {
            this.selector.clear();
            this.emitChange();
          }
        );
        return;
    }
  }
}
