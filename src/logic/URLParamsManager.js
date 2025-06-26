export class URLParamsManager {
  /** Ensurse that the getParams only runs once it it's lifetime */
  static #firstLoad = false;

  static getParams() {
    if (!this.#firstLoad) {
      const queryParameters = new URLSearchParams(window.location.search);

      if (queryParameters.get("qubits") != null) {
        this.defaultQubits = parseInt(queryParameters.get("qubits"));
      }

      if (queryParameters.get("columns") != null) {
        this.defaultColumns = parseInt(queryParameters.get("columns"));
      }

      if (queryParameters.get("quicscript") != null) {
        this.defaultQuic = queryParameters.get("quicscript");
      }

      if (queryParameters.get("qibo") != null) {
        const condition = queryParameters.get("qibo");
        if (condition == "true") this.qibo = true;
        else if (condition == "false") this.qibo = false;
      }

      if (queryParameters.get("input") != null) {
        const condition = queryParameters.get("input");
        if (condition == "true") this.displayInput = true;
        else if (condition == "false") this.displayInput = false;
      }

      if (queryParameters.get("type") != null) {
        this.defaultResultDelimiter = allowedType[queryParameters.get("type")];
      }

      this.#firstLoad = true;
    }
    return this;
  }
}
