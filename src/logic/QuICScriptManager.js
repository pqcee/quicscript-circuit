import { Gates } from "./Gates";
import {
  delimiter,
  parseComplexNumber,
  rGates,
  stringToQubits,
  allowedType,
} from "./Helper";

/**
 * QuICScriptManager manages QuICScript import and engine
 * @class
 * @constructor
 * @public
 */
export class QuICScriptManager {
  /**
   * String pointing to QuICScript.js url
   * @type {String}
   */
  scriptSrc = import.meta.env.quicscript_url;

  /**
   * If QuICScript.js has been loaded onto the html
   * @type {boolean}
   */
  loaded = false;

  /**
   * Number of Qubits use for Engine
   * @type {number}
   */
  qubits = 0;

  /**
   * If started, restrict qubit to this.qubits
   * @type {boolean}
   */
  started = false;

  /**
   * Stores an array of QuICScriptState
   * @type {QuICScriptState[]}
   */
  quicResults = [];

  /**
   * Results from the current run of circuit
   * @type {QuICScriptState[]}
   */
  runQuicResults = [];

  /**
   * QuicSCript Equation Result (Require _ to be appended to the end of the string)
   * @type {StateResult[] | undefined}
   */
  quicEquationResults = [];

  /**
   * QuicSCript Equation Result Delimiter
   * @type {string}
   */
  resultDelimiter = "";

  /**
   * Constant for parametric gates
   * @type {string[]}
   */
  PARAMETRIC_GATES = ["U", "x", "y", "z"];

  /**
   * Create a QuICScriptManager
   */
  constructor(resultDelimiter = null) {
    this.loadQuICScript();
    this.resultDelimiter = resultDelimiter;
  }

  /**
   * Loads QuICScript into HTML
   */
  loadQuICScript() {
    const script = document.createElement("script");
    script.src = this.scriptSrc;
    script.async = true;
    script.onload = () => {
      console.log(script.src + " has been loaded!");
      this.loaded = true;
    };
    document.body.appendChild(script);
  }

  /**
   * Start QuICScript engine
   * @param {number} qubits Number of qubits (qubits >= 1)
   * @returns {boolean} True if QuICScript started, False if Error Starting
   */
  start(qubits) {
    if (qubits < 1) {
      console.error("Invalid Qubit Amount: " + qubits);
      return false;
    }
    if (this.started) this.stop();
    if (this.loaded) {
      Module._QuICScript_begin(qubits);
      console.log("QuICScript begin");
      this.qubits = qubits;
      this.started = true;
      return true;
    } else console.error(`error ${this.scriptSrc} not loaded`);
  }

  /**
   * Stop QuICScript engine
   */
  stop() {
    if (this.started) {
      Module._QuICScript_end();
      console.log("QuICScript end");
      this.quicResults = [];
      this.runQuicResults = [];
      this.started = false;
    }
  }

  /**
   * Reset QuICScript engine
   */
  engineReset() {
    Module._QuICScript_end();
    Module._QuICScript_begin(this.qubits);
  }

  /**
   * Process quicString column by column, handling parametric gates
   * @param {string} quicString - The QuIC string to process
   * @param {Gates} gates - Gates object for parameter values
   * @param {string} runDelimiter - Delimiter to use for each column
   * @returns {Object} { finalResult: string, columnResults: QuICScriptState[] }
   */
  processQuicColumns(quicString, gates, runDelimiter) {
    const columnResults = [];
    let finalResult = "";

    // Remove trailing delimiter if present for splitting
    const cleanString = quicString.endsWith(runDelimiter)
      ? quicString.slice(0, -1)
      : quicString;

    const columns = cleanString.split(",");

    // Check if we need parametric gate processing
    const hasParametricGates = this.PARAMETRIC_GATES.some((gate) =>
      quicString.includes(gate)
    );

    if (hasParametricGates) {
      // Process each column with parametric gate handling
      columns.forEach((columnString, column) => {
        const hasUGate = columnString.includes("U");
        const hasRGate = rGates.some((gate) => columnString.includes(gate));

        // Ensure column has delimiter
        if (!columnString.includes(runDelimiter)) {
          columnString = columnString + runDelimiter;
        }

        let result;
        if (hasUGate) {
          result = this.runQuICScript_cont(
            columnString,
            gates.getUGateColumnValue(column)
          );
        } else if (hasRGate) {
          const firstRGateType = columnString
            .split("")
            .find((gate) => rGates.includes(gate));
          result = this.runQuICScript_cont(
            columnString,
            gates.getRGateValue(column, firstRGateType)
          );
        } else {
          result = this.runQuICScript_cont(columnString);
        }

        columnResults.push(new QuICScriptState(columnString, result));
        if (column === columns.length - 1) {
          finalResult = result;
        }
      });
    } else {
      // Simple processing without parametric gates
      columns.forEach((columnStr) => {
        const result = this.runQuICScript_cont(columnStr + runDelimiter);
        columnResults.push(
          new QuICScriptState(columnStr + runDelimiter, result)
        );
      });

      // Reset and run full string for final result
      this.engineReset();
      finalResult = this.runQuICScript_cont(cleanString + runDelimiter);
    }

    return { finalResult, columnResults };
  }

  /**
   * Calls the module
   * @param {Gates} gates
   * @param {string} quicString Quic string
   */
  runQuICSimulator(quicString, gates) {
    if (this.qubits != stringToQubits(quicString)) {
      console.error("Qubits amount unexpected");
      return false;
    }

    // Add default delimiter if needed
    if (!delimiter.includes(quicString[quicString.length - 1])) {
      const defaultDelimiterType = this.resultDelimiter;
      const defaultDelimiter = allowedType[defaultDelimiterType];
      quicString = quicString + defaultDelimiter;
    }

    const runDelimiter = quicString[quicString.length - 1];

    if (!this.started) {
      console.error("QuICScript not started");
      return;
    }

    console.log({
      message: "QuICScript run 'QuICScript_cont",
      Qubits: this.qubits,
      "Quic String": quicString,
    });

    // Process columns and get results
    const { finalResult, columnResults } = this.processQuicColumns(
      quicString,
      gates,
      runDelimiter
    );

    // Store column results
    this.runQuicResults = columnResults;

    // Format final result to remove ,0.00% lines
    let result = finalResult
      .split("\n")
      .map((str) => (str.includes(",0.00%") ? null : str))
      .filter((a) => a)
      .join("\n");

    console.log("QuICScript result: " + result);

    if (result.includes("Error")) {
      console.error({
        message: "Error occured",
        called: {
          qubits: this.qubits,
          quic: quicString,
        },
        previousState: this.quicResults,
      });
    }

    this.quicResults.push(new QuICScriptState(quicString, result));

    // Generate equation results using the same processing logic
    this.generateEquationResults(quicString, gates, runDelimiter);

    return result;
  }

  /**
   * Generate equation results by processing with '_' delimiter
   * @param {string} quicString Quic string (with current delimiter)
   * @param {Gates} gates Gates object
   */
  generateEquationResults(quicString, gates) {
    // Replace current delimiter with '_' for equation format
    const equationString = quicString.slice(0, -1) + "_";

    this.engineReset();

    // Reuse the same column processing logic
    const { finalResult } = this.processQuicColumns(equationString, gates, "_");

    if (finalResult == null) {
      this.quicEquationResults = null;
      return;
    }

    const holderArray = [];
    let error = false;

    finalResult
      .split("\n")
      .slice(0, -1)
      .forEach((e) => {
        const [state, result] = e.slice(0, -1).split(",");

        if (result == 0) return;

        const complexNumber = parseComplexNumber(result);

        if (complexNumber == null) {
          console.error("Unable to parse result: " + result);
          console.error("Disable update Equation Results for this run");
          error = true;
          return;
        }

        const { real, imaginary } = complexNumber;
        holderArray.push(new StateResult(state, real, imaginary));
      });

    this.quicEquationResults = error ? null : holderArray;
    this.engineReset();
  }

  runQuICScript_cont(quicString, input = null) {
    let parameter = [this.qubits, quicString, 1, 0, 0, 0, 0, 0, 1, 0];
    console.log(input);
    if (input != null) {
      if (typeof input === "object") {
        const { theta, phi, lambda } = input;
        parameter = [
          this.qubits,
          quicString,
          theta,
          phi,
          lambda,
          0,
          0,
          0,
          0,
          0,
        ];
      } else if (typeof input === "number") {
        const alpha = input;
        parameter = [this.qubits, quicString, alpha, 0, 0, 0, 0, 0, 0, 0];
      }
    }
    console.log(parameter);
    return Module.ccall(
      "QuICScript_cont",
      "string",
      [
        "number",
        "string",
        "number",
        "number",
        "number",
        "number",
        "number",
        "number",
        "number",
        "number",
      ],
      parameter
    );
  }

  /**
   * Generate Qibo Script
   * @param {string} quicString Quic string
   * @param {number} qubits Number of Qubits
   * @param {Gates} gates Gates object to get U gate values
   * @return {string} QuICScript_Qibo return result
   */
  runGenerateQibo(quicString, gates) {
    if (this.loaded) {
      const qubits = stringToQubits(quicString);
      const { theta, phi, lamda } = this.getFirstUGateValue(gates, quicString);
      return Module.ccall(
        "QuICScript_Qibo",
        "string",
        ["number", "string", "number", "number", "number"],
        [qubits, quicString, theta, phi, lamda]
      );
    } else {
      console.error("QuICScript not loaded");
    }
  }

  /**
   * Helper function to get first U gates info
   * @param {Gates} gates
   * @param {*} quicString
   * @returns theta, phi, lamda values of the first U gate in the quicString
   */
  getFirstUGateValue(gates, quicString) {
    let column = 0;
    for (const char of quicString) {
      if (char === "U") {
        return gates.getUGateColumnValue(column);
      } else if (char === ",") column++;
    }
    return { theta: 0, phi: 0, lamda: 0 };
  }

  /**
   * Return Script Result
   */
  getResults() {
    return {
      results: this.quicResults,
      qubits: this.qubits,
    };
  }
}

/**
 * Supports storing of past script and results
 * @property {string} script - Script ran
 * @property {string} result - Result from script
 */
class QuICScriptState {
  script = "";
  result = "";

  /**
   * Calls the module
   * @param {string} script Quic string
   * @param {string} result Result from "QuICScript_cont"
   */
  constructor(script, result) {
    this.script = script;
    this.result = result;
  }
}

/**
 * For QuiSCript Equations
 */
export class StateResult {
  state = 0;
  real = 0;
  imaginary = 0;
  constructor(state, real, imaginary) {
    this.state = state;
    this.real = real;
    this.imaginary = imaginary;
  }
}
