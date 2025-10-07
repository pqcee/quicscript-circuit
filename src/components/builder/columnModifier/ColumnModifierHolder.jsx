// Module imports
import styled from "@emotion/styled";

// Logic class imports
import { ADDCOLUMNRIGHTAT, DELETECOLUMNAT, Gates } from "../../../logic/Gates";

// Component imports
import { ColumnModifier } from "./ColumnModifier";
import { ToolTip } from "../ToolTip";
import { COPY, MOVE, Selector } from "../Selector";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  column-gap: 20px;
  margin-top: 10px;
  flex-wrap: wrap;
  row-gap: 10px;
`;

/**
 * @param {Object} props
 * @param {Gates} props.gates
 * @returns
 */
export function ColumnModifierHolder({
  gates,
  setUpdateSelect,
  setOverColumn,
}) {
  const columnModifiers = [
    {
      backgroundColor: "#63E6BE",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="18px"
          viewBox="0 -960 960 960"
          width="18px"
          fill="#fff"
        >
          <path d="M160-760v560h240v-560H160ZM80-120v-720h720v160h-80v-80H480v560h240v-80h80v160H80Zm400-360Zm-80 0h80-80Zm0 0Zm320 120v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z" />
        </svg>
      ),
      name: ADDCOLUMNRIGHTAT,
      tooltip: "Add column to the right",
    },
    {
      backgroundColor: "#E03131",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="18px"
          viewBox="0 -960 960 960"
          width="18px"
          fill="#fff"
        >
          <path d="M172.31-180Q142-180 121-201q-21-21-21-51.31v-455.38Q100-738 121-759q21-21 51.31-21h190v60h-190q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v455.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h190v60h-190ZM450-100v-760h60v80h277.69Q818-780 839-759q21 21 21 51.31v455.38Q860-222 839-201q-21 21-51.31 21H510v80h-60Zm60-140h277.69q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-455.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H510v480Zm-350 0v-480 480Zm640 0v-480 480Z" />
        </svg>
      ),
      name: DELETECOLUMNAT,
      tooltip: "Delete column",
    },
  ];
  return (
    <Wrapper>
      {columnModifiers.map((modifier, i) => (
        <ToolTip key={i} text={modifier.tooltip}>
          <ColumnModifier
            {...modifier}
            gates={gates}
            setOverColumn={setOverColumn}
          />
        </ToolTip>
      ))}
      <Selector gates={gates} setUpdateSelect={setUpdateSelect} mode={COPY} />
      <Selector gates={gates} setUpdateSelect={setUpdateSelect} mode={MOVE} />
    </Wrapper>
  );
}
