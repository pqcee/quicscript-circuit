// Module imports
import { useEffect, useState } from "react";

// Components imports
import {
  AngleDiv,
  Dropdown,
  SymbolInput,
  Wrapper,
  AngleInputWrapper,
} from "./ParametricGateStyledComponents";
import { Gates } from "../../../logic/Gates";

/**
 * Angle input for R Gate
 * @param {number} column
 * @param {string} type
 * @param {Gates} gates
 * @param {boolean} mouseOver
 * @returns {JSX.Element}
 */
const RGateAngleInput = ({ column, type, gates, mouseOver }) => {
  const [angleValue, setAngleValue] = useState(0);

  useEffect(() => {
    setAngleValue(gates.getRGateValue(column, type));
  }, [mouseOver]);

  const updateAngleValue = (value) => {
    gates.setRGateValue(column, type, parseFloat(value));
    setAngleValue(value);
  };

  return (
    <AngleInputWrapper>
      <AngleDiv>α</AngleDiv>
      <SymbolInput
        type="number"
        value={angleValue}
        step="0.01"
        onChange={(e) => updateAngleValue(e.target.value)}
      />
    </AngleInputWrapper>
  );
};

/**
 * R Gate with angle dropdown
 * @param {boolean} disable
 * @param {number} column
 * @param {string} type
 * @param {Gates} gates
 * @returns {JSX.Element}
 */
const RGate = ({ disable, column, type, gates }) => {
  const [mouseOver, setMouseOver] = useState(false);

  let rGate;
  if (type === "x") {
    rGate = "Rx";
  } else if (type === "y") {
    rGate = "Ry";
  } else if (type === "z") {
    rGate = "Rz";
  }

  return (
    <Wrapper
      onMouseOver={(e) => {
        if (!disable) setMouseOver(!mouseOver);
      }}
    >
      <span>{rGate}</span>
      {!disable && (
        <Dropdown className="rInputElements" data-no-drag="true">
          <RGateAngleInput
            column={column}
            type={type}
            gates={gates}
            mouseOver={mouseOver}
          />
        </Dropdown>
      )}
    </Wrapper>
  );
};

export default RGate;
