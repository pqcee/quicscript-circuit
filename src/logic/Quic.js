import { maxQubits } from "./Gates";
import { quicDelimiterRemoval, stringToQubits } from "./Helper";

export class Quic {
  valid = false;
  qubits = 0;
  columns = 0;
  quic = "";
  allowedGates = null;
  constructor(quic = "", allowedGates) {
    if (Quic.quicValidator(quic, allowedGates)) {
      this.quic = quic;
      this.allowedGates = allowedGates;
      this.valid = true;
      this.qubits = stringToQubits(quic);
      if (this.qubits > maxQubits) {
        console.error(
          `Quic String (use ${this.qubits}) using more than maxQubits ${maxQubits}`
        );
        this.valid = false;
      }
      this.columns = quic.split(",").length;
    }
  }

  /**
   * Helps in ensuring that Quic object is valid
   * @returns Quic object if Quic object is valid
   */
  validate() {
    return this.valid ? this : null;
  }

  /**
   * Validates if quic is valid
   * @param {string} quic
   * @returns boolean
   */
  static quicValidator(quic, allowedGates) {
    if (!quic || quic.length == 0) return false;

    quic = quicDelimiterRemoval(quic);

    const allowedCharacters = allowedGates.concat([",", "I"]);

    if (quic.split("").some((char) => !allowedCharacters.includes(char))) {
      // Contains invalid characters
      console.warn("Quic Validator: quic contains invalid characters");
      // TODO: Alert?
      return false;
    }

    // TODO: Check if need make sure qubits < maxQubits

    return true;
  }
}
