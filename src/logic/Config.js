import { URLParamsManager } from "./URLParamsManager";

/**
 * Enum for result output types values.
 * @enum {string}
 */
const allowedType = {
  decimal: ".",
  invbinary: "~",
  binary: ":",
};

export class Config {
  /** Ensurse that the getConfig only runs once it it's lifetime */
  static #firstLoad = false;

  /** Default config, can be Nan and null */
  static defaultQubits = null;
  static defaultColumns = null;
  static defaultQuic = null;

  /**
   * Set if qibo needs to be display
   * @type {boolean}
   */
  static qibo = false;

  /**
   * Default result output type
   * @type {string}
   */
  static defaultResultDelimiter = allowedType["binary"]; // NUS requested it to be binary

  /**
   * Flag to display input
   * @type {boolean}
   */
  static displayInput = true;

  static allConfig = [
    "defaultQubits",
    "defaultColumns",
    "defaultQuic",
    "qibo",
    "defaultResultDelimiter",
    "displayInput",
  ];

  /**
   * getConfig is the main method for the visualization to get the config object
   * which will be applied to the visualization on various places and features.
   *
   * It will retrieve config from index.html first then from URL params.
   *
   * @returns {Config} Returns the config object
   */
  static getConfig() {
    if (!this.#firstLoad) {
      // config is an object is initialized in index.html
      if (defaultConfig != null && typeof defaultConfig === "object") {
        this.allConfig.forEach((c) => {
          if (c in defaultConfig) this[c] = defaultConfig[c];
        });
        if ("defaultResultDelimiter" in defaultConfig) {
          this.defaultResultDelimiter =
            allowedType[defaultConfig.defaultResultDelimiter];
        }
      }

      // Default defaultConfig will be overwritten by URL params
      const urlParam = URLParamsManager.getParams();
      this.allConfig.forEach((config) => {
        if (urlParam[config] != null) this[config] = urlParam[config];
      });
      this.#firstLoad = true;

      console.log(this.defaultResultDelimiter);
    }
    return this;
  }
}
