import styled from "@emotion/styled";
import { Gate, GateSize } from "./Gate";
import { useDrop } from "../logic/Dnd";
import { Gates } from "../logic/Gates";
import { useMemo } from "react";
import { modeColors } from "./Selector";

const Wrapper = styled.div`
  margin: 4px 5px;
  box-sizing: border-box;
  position: relative;
  &:before {
    content: " ";
    display: ${(props) => (props.controlledDistance > 0 ? "block" : "none")};
    position: absolute;
    background-color: black;
    margin-left: auto;
    margin-right: auto;
    right: 0;
    left: 0;
    width: 2px;
    top: 20px;
    height: ${(props) => props.controlledDistance * 48}px;
    z-index: -1;
  }
  &:after {
    content: " ";
    display: ${(props) => (props.selected ? "block" : "none")};
    height: 40px;
    width: 40px;
    background-color: ${(props) => props.modeColor};
    position: absolute;
    opacity: 0.5;
    top: 0;
    cursor: ${(props) => (props.selected ? "pointer" : "grab")};
  }
`;

/**
 * Slot component
 * @param {Object} props - Props of component
 * @param {number} props.qubit - The qubit the gate belong to
 * @param {number} props.column - The column the gate belong to
 * @param {string} props.gate - The gate name
 * @param {Gates} props.gates - The gates manager
 * @param {boolean} props.controlledHighlight - If it's part of controlled
 * @param {number} props.controlledDistance - Number of gates distance
 */
export function Slot({
  qubit,
  column,
  gate,
  gates,
  controlledHighlight,
  controlledDistance,
  setOverColumn,
  selected,
}) {
  const [{}, drop] = useDrop(
    () => gates.moveGate(qubit, column),
    column,
    setOverColumn
  );

  const modeColor = useMemo(() => {
    if (selected && gates.selector.currentMode) {
      return modeColors[gates.selector.currentMode];
    } else return "white";
  }, [selected, gates.selector.currentMode]);

  return (
    <Wrapper
      controlledDistance={controlledDistance}
      selected={selected}
      ref={drop}
      style={{
        ...GateSize,
        border: gate ? "" : "1px dashed #d1d5db",
      }}
      data-x={qubit}
      data-y={column}
      modeColor={modeColor}
    >
      {gate != "" ? (
        <Gate {...{ qubit, column, gate, gates, controlledHighlight }} />
      ) : (
        ""
      )}
    </Wrapper>
  );
}
