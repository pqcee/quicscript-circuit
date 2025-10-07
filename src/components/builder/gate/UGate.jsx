// Module imports
import { useEffect, useMemo, useState } from "react";

// Logic class imports
import { Gates } from "../../../logic/Gates";

// Component imports
import {
  Wrapper,
  Dropdown,
  AngleDiv,
  SymbolInput,
  AngleInputWrapper,
} from "./ParametricGateStyledComponents";

/**
 * Individual Euler Angle
 * @param {Object} props
 * @param {string} props.angle
 * @param {number} props.column
 * @param {Gates} props.gates - The gates manager
 * @param {boolean} props.mouseOver
 * @returns {JSX.Element}
 */
function EulerAngleInput({ angle, column, gates, mouseOver }) {
  const [angleValue, setAngleValue] = useState(0);

  const requireIH = useMemo(() => angle == "φ", [angle]);

  useEffect(() => {
    setAngleValue(gates.getUGateValue(column, angle));
  }, [mouseOver]);

  function updateAngleValue(value) {
    gates.setUGateValue(column, angle, parseFloat(value));
    setAngleValue(value);
  }

  return (
    <AngleInputWrapper>
      <AngleDiv className={requireIH ? "line-height" : ""}>{angle}</AngleDiv>
      <SymbolInput
        type="number"
        value={angleValue}
        step="0.01"
        onChange={(e) => updateAngleValue(e.target.value)}
      />
    </AngleInputWrapper>
  );
}

const angles = ["ϴ", "φ", "λ"];

/**
 * U Gate with Euler angles dropdown
 * @param {Object} props
 * @param {boolean} props.disable
 * @param {number} props.column
 * @param {Gates} props.gates - The gates manager
 * @returns
 */
export function UGate({ disable, column, gates }) {
  const [mouseOver, setMouseOver] = useState(false);
  return (
    <Wrapper
      onMouseOver={(e) => {
        if (!disable) setMouseOver(!mouseOver);
      }}
    >
      <span>U</span>
      {!disable && (
        <Dropdown className="uInputElements" data-no-drag="true">
          {angles.map((angle) => (
            <EulerAngleInput
              key={angle}
              angle={angle}
              column={column}
              gates={gates}
              mouseOver={mouseOver}
            />
          ))}
        </Dropdown>
      )}
    </Wrapper>
  );
}
