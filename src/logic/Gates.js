import { COPY, MOVE } from "../components/Selector.jsx";
import GateModel from "../models/GateModel.js";
import { quicDelimiterRemoval } from "./Helper.js";
import { Quic } from "./Quic.js";
import { Selector } from "./Selector.js";

/** Default Setting for Builder if quic is null */
const defaultConfig = {
  qubits: 9,
  columns: 20,
};

// Special Methods
export const ADDCOLUMNRIGHTAT = "AddColumnRightAt";
export const DELETECOLUMNAT = "DeleteColumnAt";
export const MOVESELECTOR = "Move Selector";
export const COPYSELECTOR = "Copy Selector";
export { COPY, MOVE };

export const maxQubits = 20;

export class Gates {
  gateSlots = [];
  observers = [];
  draggingGate = new GateModel(null, null, null);
  qubits = defaultConfig.qubits;
  columns = defaultConfig.columns;
  uHolder = {};

  constructor(
    qubits = defaultConfig.qubits,
    columns = defaultConfig.columns,
    quic = ""
  ) {
    // Initial Class
    this.selector = new Selector();

    // console.log(qubits, columns, quic); // Nan Nan null
    if (quic != null) {
      const quicObj = new Quic(quic).validate();
      if (quicObj) {
        // Case 1 & 2: Quic is valid
        this.qubits = quicObj.qubits;
        this.columns = quicObj.columns;
        // Case 2: Valid Qubits or Columns
        if (!!qubits && qubits > quicObj.qubits) this.qubits = qubits;
        if (!!columns && columns > quicObj.columns) this.columns = columns;
      } else {
        //TODO: Let user know quic is invalid
        console.error("Config Error: Invalid quic: " + quic);
        console.error(
          `Switch to default config (qubits: ${defaultConfig.qubits}, columns: ${defaultConfig.columns})`
        );
        quic = "";
      }
    } else {
      if (!qubits && !columns) {
        /**
         *  Case 3: Use Default
         *  Variable: quic null, qubits NaN, columns NaN
         */
        this.qubits = defaultConfig.qubits;
        this.columns = defaultConfig.columns;
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

  deleteQubit(qubit) {
    if (this.qubits == 1) {
      this.gateSlots[0] = new Array(this.columns).fill("");
    } else {
      this.gateSlots.splice(qubit, 1);
      this.qubits--;
    }
    this.emitChange();
  }

  addQubit() {
    this.gateSlots.push(new Array(this.columns).fill(""));
    this.qubits++;
    this.emitChange();
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
    this.addMultipleColumn(1);
  }

  /**
   * Add Multiple Columns
   * @param {number} n
   */
  addMultipleColumn(n) {
    this.gateSlots.forEach((a) => a.push(...new Array(n).fill("")));
    this.columns++;
    this.emitChange();
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

  observe(o) {
    this.observers.push(o);
    this.emitChange();
    return () => {
      this.observers = this.observers.filter((t) => t !== o);
    };
  }

  moveGate(toQubit, toColumn) {
    // console.log({ ...this.draggingGate, toQubit, toColumn });
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

    this.emitChange();
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
      this.emitChange();
    }
  }

  canMoveGate(toQubit, toColumn) {
    // const [qubit, column] = this.gatePosition;
    // const dx = toQubit - qubit;
    // const dy = toColumn - column;
    return true;
  }

  emitChange() {
    const gateSlots = this.gateSlots;
    this.observers.forEach(
      (o) => o && o(JSON.parse(JSON.stringify(gateSlots)))
    );
  }

  /**
   * For external callback_render
   * @param {string} quicscript
   */
  dynamicUpdateWithQuicscript(quicscript) {
    // Check depth of quicscript
    const columns = quicscript.split(",").length;

    // Compare with current depth
    if (columns > this.columns) this.addMultipleColumn(columns - this.columns);

    this.updateWithQuicscript(quicscript);
  }

  updateWithQuicscript(quicscript) {
    if (quicscript != "" && (!quicscript || quicscript.length == 0)) return; // Empty or Null quic

    const quicArr = quicDelimiterRemoval(quicscript).split(",");

    this.gateSlots = this.gateSlots.map((arr, i) =>
      arr.map((_, y) => {
        if (quicArr.length > y && quicArr[y].length > i) {
          return quicArr[y][i] == "I" ? "" : quicArr[y][i];
        }
        return "";
      })
    );
    this.emitChange();
  }

  ifColumnHasGate(column, gate) {
    return this.gateSlots.some((gates) => gates[column] == gate);
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
      const theta = this.uHolder[column]["ϴ"];
      const phi = this.uHolder[column]["φ"];
      const lamda = this.uHolder[column]["λ"];
      return {
        theta: theta ? theta : 0,
        phi: phi ? phi : 0,
        lamda: lamda ? lamda : 0,
      };
    }
    return { theta: 0, phi: 0, lamda: 0 };
  }

  setAllUGateValue({ theta, phi, lamda }, column) {
    this.uHolder[column] = {};
    this.uHolder[column]["ϴ"] = theta;
    this.uHolder[column]["φ"] = phi;
    this.uHolder[column]["λ"] = lamda;
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
