import { Gates } from "./Gates";

export class Selector {
  stepper = 0;
  selector = false;
  highlight = null;
  q1 = null;
  c1 = null;
  q2 = null;
  c2 = null;
  callbackUpdate = null;
  selectedGates = null;
  dragCoordinates = null;
  currentMode = null;

  trigger(q, c, mode) {
    // console.log("Selector", q, c);
    if (q == null || c == null) return this.clear();
    if (this.currentMode !== mode) this.clear();
    if (!this.selector) {
      this.currentMode = mode;
      this.selector = true;
      this.q1 = q;
      this.c1 = c;
      this.highlight = {};
      this.highlight[q] = {};
      this.highlight[q][c] = true;
      this.stepper = 1;
      this.triggerCallbackUpdate();
    } else if (this.selector && this.stepper == 1) {
      this.q2 = q;
      this.c2 = c;
      this.generateArea();
      this.stepper = 2;
      this.triggerCallbackUpdate();
    } else this.clear();
    // console.log(this.q1, this.c1, this.q2, this.c2);
  }

  updateSelect(q, c) {
    if (this.selector && this.stepper == 1) {
      this.q2 = parseInt(q);
      this.c2 = parseInt(c);
      this.generateArea();
      this.triggerCallbackUpdate();
    }
  }

  clearSelect() {
    if (this.selector && this.stepper == 1) {
      if (this.q1 != this.q2 || this.c1 != this.c2) {
        this.q2 = this.q1;
        this.c2 = this.c1;
        this.generateArea();
        this.triggerCallbackUpdate();
      }
    }
  }

  confirmSelection(q, c) {
    if (this.selector && this.stepper == 1) {
      this.updateSelect(q, c);
      this.stepper = 2;
    }
  }

  generateArea() {
    function listNumbers(start, end) {
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    const width =
      this.q1 > this.q2
        ? listNumbers(this.q2, this.q1)
        : listNumbers(this.q1, this.q2);
    const height =
      this.c1 > this.c2
        ? listNumbers(this.c2, this.c1)
        : listNumbers(this.c1, this.c2);
    this.highlight = {};
    for (let q of width) {
      this.highlight[q] = {};
      for (let c of height) {
        this.highlight[q][c] = true;
      }
    }
  }

  clear() {
    // console.log("Clear Selector");
    this.selector = false;
    this.highlight = null;
    this.q1 = null;
    this.c1 = null;
    this.q2 = null;
    this.c2 = null;
    this.stepper = 0;
    this.selectedGates = null;
    this.dragCoordinates = null;
    this.currentMode = null;
    this.triggerCallbackUpdate();
  }

  getTopLeftCorner() {
    const tlqubit = Math.min(this.q1, this.q2);
    const tlcolumn = Math.min(this.c1, this.c2);
    return { tlqubit, tlcolumn };
  }

  getBottomRightCorner() {
    const brqubit = Math.max(this.q1, this.q2);
    const brcolumn = Math.max(this.c1, this.c2);
    return { brqubit, brcolumn };
  }

  setCallbackUpdate(callback) {
    this.callbackUpdate = callback;
  }

  triggerCallbackUpdate() {
    // console.log("Trigger Callback Update");
    if (this.callbackUpdate) this.callbackUpdate();
  }

  /**
   * @param {String[][]} gates
   */
  setSelectedGates(gates) {
    this.selectedGates = gates;
  }

  getSelectedGates() {
    return this.selectedGates;
  }

  setDragCoordinates(q, c) {
    this.dragCoordinates = { q, c };
  }

  /**
   * @param {Gates} gates - The array of gates representing the selected area.
   * @param {String[][]} gateSlots - The array of gate slots where gates are placed.
   *  @param {number} toQubit - The qubit to move the selected area to.
   * @param {number} toColumn - The column to move the selected area to.
   * @param {Function} updateCallback - The callback function to trigger updates.
   *
   */
  copySelectedArea(
    gates,
    gateSlots,
    toQubit,
    toColumn,
    uGateColumns,
    updateCallback
  ) {
    if (!this.selectedGates && !this.dragCoordinates) return;
    const { q, c } = this.dragCoordinates; // q and c represent coordinate in the selected area

    const maxQubits = gateSlots.length;
    const maxColumns = gateSlots[0].length;

    const qubitUpperlimit = toQubit;
    const columnUpperlimit = toColumn;

    // console.log({ qubitUpperlimit, columnUpperlimit });

    const tlQubit = qubitUpperlimit > q ? 0 : q - qubitUpperlimit;
    const tlcolumn = columnUpperlimit > c ? 0 : c - columnUpperlimit;

    // console.log(gateSlots, this.selectedGates, q, c);
    // console.log({ tlQubit, tlcolumn });

    const startingQubit = tlQubit - q + toQubit;
    const startingColumn = tlcolumn - c + toColumn;

    // console.log({ toQubit, toColumn });
    // console.log({ startingQubit, startingColumn });

    const minColumn = Math.min(this.c1, this.c2);

    // console.log("From Column", minColumn);
    // console.log("To Column", startingColumn - tlcolumn);

    const shiftedColumn = startingColumn - tlcolumn - minColumn;

    // console.log("Column Shift by", shiftedColumn);

    let relativeQubit = startingQubit;
    for (
      let i = tlQubit;
      i < this.selectedGates.length && relativeQubit < maxQubits;
      i++
    ) {
      let relativeColumn = startingColumn;
      for (
        let j = tlcolumn;
        j < this.selectedGates[i].length && relativeColumn < maxColumns;
        j++
      ) {
        // console.log("Relative", relativeQubit, relativeColumn);
        // console.log("Selected Coordinate", i, j);

        // console.log("Gates", gateSlots[relativeQubit][relativeColumn]);
        // console.log("Selection Gates", this.selectedGates[i][j]);
        if (this.selectedGates[i][j] !== "") {
          gateSlots[relativeQubit][relativeColumn] = this.selectedGates[i][j];
          if (this.selectedGates[i][j] == "U") {
            const column = relativeColumn - shiftedColumn;
            // console.log(`Copy ${column} to ${relativeColumn}`);
            // console.log(uGateColumns[column]);
            gates.setAllUGateValue(uGateColumns[column], relativeColumn);
          }
        }

        relativeColumn++;
      }
      relativeQubit++;
    }
    updateCallback();
  }

  /**
   * @param {Gates} gates - The array of gates representing the selected area.
   * @param {String[][]} gateSlots - The array of gate slots where gates are placed.
   * @param {Function} updateCallback - The callback function to trigger updates.
   * @returns {void}
   */
  removeSelectedArea(gates, gateSlots, updateCallback) {
    if (!this.selectedGates) return;
    const { tlqubit, tlcolumn } = this.getTopLeftCorner();
    const { brqubit, brcolumn } = this.getBottomRightCorner();

    const uGateColumns = {};

    for (let i = tlqubit; i <= brqubit; i++) {
      for (let j = tlcolumn; j <= brcolumn; j++) {
        if (gateSlots[i][j] === "U") {
          uGateColumns[j] = gates.getUGateColumnValue(j);
        }
        gateSlots[i][j] = "";
      }
    }

    Object.keys(uGateColumns).map((column) => gates.deleteUGate(column));

    // console.log("UGateColumns", uGateColumns);
    updateCallback(uGateColumns);
  }

  getSelectedUGateColumns(gates, gateSlots) {
    if (!this.selectedGates) return {};
    const { tlqubit, tlcolumn } = this.getTopLeftCorner();
    const { brqubit, brcolumn } = this.getBottomRightCorner();
    const uGateColumns = {};
    for (let i = tlqubit; i <= brqubit; i++) {
      for (let j = tlcolumn; j <= brcolumn; j++) {
        if (gateSlots[i][j] === "U") {
          uGateColumns[j] = gates.getUGateColumnValue(j);
        }
      }
    }
    return uGateColumns;
  }

  cancelSelection() {
    this.clear();
  }
}
