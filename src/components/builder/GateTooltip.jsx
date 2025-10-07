import { ToolTip } from "./ToolTip";

/**
 * GateTooltip component
 *
 * @param {Object} props - Component props
 * @param {string} props.gate - The gate string.
 * @returns {JSX.Element} The rendered component
 */
export const GateTooltip = ({ gate, children }) => {
  // ["H", "X", "Y", "Z", "C", "N", "P", "T", "I", "s", "U", "d", "m"]
  const context = {
    H: {
      name: "Hadamard gate",
    },
    X: {
      name: "Pauli-X gate",
    },
    Y: {
      name: "Pauli-Y gate",
    },
    Z: {
      name: "Pauli-Z gate",
    },
    C: {
      name: "Control gate",
    },
    N: {
      name: "Not gate",
    },
    P: {
      name: "Phase gate",
    },
    T: {
      name: "T gate",
    },
    I: {
      name: "Identity gate",
    },
    s: {
      name: "Swap gate",
    },
    U: {
      name: "U gate",
    },
    d: {
      name: "Delete Operator",
    },
    x: {
      name: "RX Gate",
    },
    y: {
      name: "RY Gate",
    },
    z: {
      name: "RZ Gate",
    },
    m: {
      name: "Measurement Operator",
    },
    M: {
      name: "Measurement Operator",
    },
  };
  return <ToolTip text={context[gate]?.name}>{children}</ToolTip>;
};
