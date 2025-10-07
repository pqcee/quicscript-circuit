// Module imports
import styled from "@emotion/styled";
import { useEffect } from "react";

// Logic class imports
import { useDrag } from "../../../logic/Dnd.js";
import { ADDCOLUMNRIGHTAT, Gates } from "../../../logic/Gates.js";
import GateModel from "../../../models/GateModel.js";

// Component imports
import { GateSize } from "../gate/Gate.jsx";

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-sizing: border-box;
  border-radius: 100%;
`;

/**
 * @param {object} props
 * @param {string} props.backgroundColor
 * @param {JSX.Element} props.icon
 * @param {Gates} props.gates
 * @returns
 */
export function ColumnModifier({
  backgroundColor,
  icon,
  gates,
  name,
  setOverColumn,
}) {
  const [{ isDragging }, drag] = useDrag(
    (q, c) => gates.moveGate(q, c),
    () => {},
    (_, column) => {
      if (column != undefined) {
        if (column == -1) {
          if (gates.isSpecialMethod() == ADDCOLUMNRIGHTAT) {
            setOverColumn(column);
          }
        } else {
          setOverColumn(column);
        }
      } else setOverColumn(-2);
      gates.selector.cancelSelection();
    },
    true
  );

  useEffect(() => {
    if (isDragging == true) gates.setDraggingGate(new GateModel(name));
  }, [isDragging]);

  return (
    <Wrapper
      ref={drag}
      style={{
        backgroundColor,
        opacity: isDragging ? 0.5 : 0.9,
        ...GateSize,
      }}
    >
      {icon}
    </Wrapper>
  );
}
