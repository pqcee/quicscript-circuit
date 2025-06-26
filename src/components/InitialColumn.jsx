import styled from "@emotion/styled";
import { useDrop } from "../logic/Dnd";
import { Gates, ADDCOLUMNRIGHTAT } from "../logic/Gates";

const Wrapper = styled.div`
  width: 40px;
  height: ${(props) => props.rows * 48}px;
  position: absolute;
`;

/**
 * Component for the initial column in the circuit editor.
 * It's not displayed, but it is used to drop addRow Modifier on it.
 * @param {object} props
 * @param {int} props.row
 * @param {function} props.setOverColumn
 * @param {Gates} props.gates
 * @returns
 */
export function InitialColumn({ rows, setOverColumn, gates }) {
  const [{}, drop] = useDrop(
    () => gates.isSpecialMethod() === ADDCOLUMNRIGHTAT && gates.moveGate(0, -1),
    -1,
    (c) => gates.isSpecialMethod() === ADDCOLUMNRIGHTAT && setOverColumn(c)
  );
  return (
    <Wrapper
      rows={rows}
      ref={drop}
      data-x={0}
      data-y={-1}
      data-droppable="true"
    ></Wrapper>
  );
}
