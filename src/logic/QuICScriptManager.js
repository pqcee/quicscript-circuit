import { Config } from "./Config";
import { Gates } from "./Gates";
import { delimiter, parseComplexNumber, stringToQubits } from "./Helper";

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
   * Create a QuICScriptManager
   */
  constructor() {
    this.loadQuICScript();
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
   * Calls the module
   * @param {Gates} gates
   * @param {string} quicString Quic string
   */
  runQuICSimulator(quicString, gates) {
    if (this.qubits != stringToQubits(quicString)) {
      console.error("Qubits amount unexpected");
      return false;
    }

    /** Adds default delimiter if delimiter isn't in quicString */
    if (!delimiter.includes(quicString[quicString.length - 1])) {
      const defaultDelimiter = Config.getConfig().defaultResultDelimiter;
      quicString = quicString + defaultDelimiter;
    }

    const runDelimiter = quicString[quicString.length - 1];

    if (this.started) {
      console.log({
        message: "QuICScript run 'QuICScript_cont",
        Qubits: this.qubits,
        "Quic String": quicString,
      });

      let result = "";

      /** If U exists in quicString */
      if (!import.meta.env.COMMUNITY && quicString.includes("U")) {
        const arr = quicString.split(",");
        arr.map((columnString, column) => {
          let r = this.runQuICScript_cont(
            columnString + runDelimiter,
            columnString.includes("U")
              ? gates.getUGateColumnValue(column)
              : null
          );
          //   console.log(r);
          if (column == arr.length - 1) result = r;
          this.runQuicResults.push(r);
        });
      } else {
        const splitDebugRun = true; // TODO: Temporary
        if (splitDebugRun) {
          this.runQuicResults = quicString
            .slice(0, -1)
            .split(",")
            .map((str) => this.runQuICScript_cont(str + "_"));
          // Reset the Engine
          this.engineReset();
        }
        result = this.runQuICScript_cont(quicString);
      }

      /** Format String to remove ,0.00% */
      result = result
        .split("\n")
        .map((str) => (str.includes(",0.00%") ? null : str))
        .filter((a) => a)
        .join("\n");

      console.log("QuICScript result: " + result);
      if (result.includes("Error")) {
        //TODO: Do Something? Stop the engine?
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

      // Getting Equation Results
      this.generateEquationResults(quicString.slice(0, -1) + "_");

      return result;
    } else {
      console.error("QuICScript not started");
    }
  }

  runQuICScript_cont(quicString, input = null) {
    let parameter = [this.qubits, quicString, 1, 0, 0, 0, 0, 0, 1, 0];
    if (input != null) {
      const { theta, phi, lamda } = input;
      parameter = [this.qubits, quicString, theta, phi, lamda, 0, 0, 0, 0, 0];
    }
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
   *
   * @param {string} quicString Quic string
   */
  generateEquationResults(quicString) {
    this.engineReset();
    const results = this.runQuICScript_cont(quicString);
    // store results into quicEquationResults = [];
    // Example quicString = "X,H,T_" = '0,0.7071;\n1,-0.5-0.5i;\n'
    // quicEquationResults => |phi> = 0.7071|0> -(0.5+0.5i)|1>
    let error = false;
    if (results == null) return (this.quicEquationResults = null);

    const holderArray = [];

    results
      .split("\n")
      .slice(0, -1)
      .forEach((e) => {
        const [state, result] = e.slice(0, -1).split(",");
        // result = "-0.5-0.5i"
        // split result into real and imaginary
        if (result == 0) return;

        const complexNumber = parseComplexNumber(result);

        // console.log("Result", { result, complexNumber });

        if (complexNumber == null) {
          console.error("Unable to parse result: " + result);
          console.error("Disable update Equation Results for this run");
          error = true;
          return null;
        }
        const { real, imaginary } = complexNumber;
        console.log({ state, real, imaginary });
        holderArray.push(new StateResult(state, real, imaginary));
      });

    this.quicEquationResults = holderArray;
    if (error) this.quicEquationResults = null;
    this.engineReset();
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
