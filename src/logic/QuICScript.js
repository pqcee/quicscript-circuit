import { Gates } from "./Gates";

export class QuICScript {
  /**
   * Gates manager
   * @type {?Gates}
   */
  static gates = null;

  /**
   * Render the QuICScript string onto the visualizer
   * Requires gates to be loaded
   * @param {string} quicscript
   */
  static render(quicscript) {
    if (QuICScript.gates)
      QuICScript.gates.dynamicUpdateWithQuicscript(quicscript);
    else console.error("Gates not loaded");
  }

  /**
   * Set the gate manager
   * @param {Gates} gates
   */
  static setGates(gates) {
    QuICScript.gates = gates;
    if (typeof callback_render !== "undefined") {
      callback_render(QuICScript.render);
    }
  }
}
