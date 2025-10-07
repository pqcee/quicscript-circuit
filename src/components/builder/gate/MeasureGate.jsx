// Module imports
import { useState } from "react";
import styled from "@emotion/styled";

// Components imports
import { Dropdown, Wrapper } from "./ParametricGateStyledComponents";
import { useGateSettings } from "../../../contexts/GateSettingsContext";
import { Measure } from "../../assets/Measure";
import { MultiShotMeasure } from "../../assets/MultiShotMeasure";

const CheckboxWrapper = styled.div`
  background-color: white;
  border: 1px solid black;
  border-radius: 5px;
`;

/**
 * Checkbox for setting multi-shot measure gate
 * @param {number} qubit
 * @param {number} column
 * @param {boolean} multiShot
 * @param {Function} setMultiShot
 * @returns {JSX.Element}
 */
const SetMeasureCheckbox = ({ qubit, column, multiShot, setMultiShot }) => {
  const handleChange = (e) => {
    e.stopPropagation();
    setMultiShot(e.target.checked);
  };

  return (
    <CheckboxWrapper>
      <input
        type="checkbox"
        id={`multishot-${qubit}-${column}`}
        name="multishot"
        checked={multiShot}
        onChange={handleChange}
      />
      <label htmlFor={`multishot-${qubit}-${column}`}> Multi-shot</label>
    </CheckboxWrapper>
  );
};

/**
 * Measure gate with multi-shot checkbox dropdown
 * @param {boolean} disable
 * @param {number} qubit
 * @param {number} column
 * @returns {JSX.Element}
 */
const MeasureGate = ({ disable, useCustomGate, qubit, column }) => {
  const [mouseOver, setMouseOver] = useState(false);

  const { multiShot, setMultiShot } = useGateSettings();

  const renderMeasureGate = () => {
    if (useCustomGate) {
      if (multiShot) {
        return <MultiShotMeasure />;
      }
      return <Measure />;
    } else if (multiShot) {
      return "M";
    } else {
      return "m";
    }
  };

  return (
    <Wrapper
      onMouseOver={(e) => {
        if (!disable) setMouseOver(!mouseOver);
      }}
    >
      <span>{renderMeasureGate()}</span>
      {!disable && (
        <Dropdown className="mCheckboxElements" data-no-drag="true">
          <SetMeasureCheckbox
            qubit={qubit}
            column={column}
            multiShot={multiShot}
            setMultiShot={setMultiShot}
          />
        </Dropdown>
      )}
    </Wrapper>
  );
};

export default MeasureGate;
