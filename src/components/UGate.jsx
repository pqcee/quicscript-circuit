import styled from "@emotion/styled";
import { useEffect, useMemo, useState } from "react";
import { Gates } from "../logic/Gates";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  justify-content: center;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  position: relative;
  border: 1px solid transparent;
  &:hover {
    > div {
      display: grid;
    }
  }
`;

const Dropdown = styled.div`
  z-index: 9;
  display: none;

  position: absolute;
  width: 105px;
  top: 39px;

  border-radius: 5px 0 0 5px;
  overflow: hidden;
`;

const SymbolInput = styled.input`
  display: inline-block;
  width: 80px;
  box-sizing: border-box;
`;

const AngleDiv = styled.div`
  display: inline-block;
  background-color: aqua;
  width: 25px;
  align-items: center;
  text-align: center;
  &.line-height {
    line-height: 17px;
  }
`;

const EulerAngleInputWrapper = styled.div`
  display: flex;
`;

/**
 * Individual Euler Angle
 * @param {Object} props
 * @param {string} props.angle
 * @param {number} props.column
 * @param {Gates} props.gates - The gates manager
 * @returns
 */
function EulerAngleInput({ angle, column, gates, something }) {
  const [angleValue, setAngleValue] = useState(0);

  const requireIH = useMemo(() => angle == "φ", [angle]);

  useEffect(() => {
    setAngleValue(gates.getUGateValue(column, angle));
  }, [something]);

  function updateAngleValue(value) {
    gates.setUGateValue(column, angle, parseFloat(value));
    setAngleValue(value);
  }

  return (
    <EulerAngleInputWrapper>
      <AngleDiv className={requireIH ? "line-height" : ""}>{angle}</AngleDiv>
      <SymbolInput
        type="number"
        value={angleValue}
        step="0.01"
        onChange={(e) => updateAngleValue(e.target.value)}
      />
    </EulerAngleInputWrapper>
  );
}

const angles = ["ϴ", "φ", "λ"];

/**
 *
 * @param {Object} props
 * @param {boolean} props.disable
 * @param {number} props.column
 * @param {Gates} props.gates - The gates manager
 * @returns
 */
export function UGate({ disable, column, gates }) {
  const [something, setSomething] = useState(false);
  return (
    <Wrapper
      onMouseOver={(e) => {
        if (!disable) setSomething(!something);
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
              something={something}
            />
          ))}
        </Dropdown>
      )}
    </Wrapper>
  );
}
