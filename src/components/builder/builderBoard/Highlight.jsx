// Module imports
import { useMemo } from "react";
import styled from "@emotion/styled";

// Logic class imports
import { ADDCOLUMNRIGHTAT, DELETECOLUMNAT } from "../../../logic/Gates";

const Wrapper = styled.div`
  display: flex;
  padding-left: 35px;
  gap: 40px;
  position: absolute;
  margin-top: 4px;
  height: ${(props) => 48 * props.qubits - 8}px;
  > div {
    height: 100%;
  }
`;

const AddColumnHighlighter = styled.div`
  background-color: #63e6be;
  width: 8px;
  margin: 0 1px;
  border-radius: 20px;
`;

const DeleteColumnHighlighter = styled.div`
  background-color: #e03131;
  width: 40px;
  margin: 0 1px;
  margin-left: 10px;
  opacity: 0.7;
`;

export function Highlight({ overColumn, qubits, gates }) {
  const highlighter = useMemo(() => {
    const name = gates.draggingGate.name;
    if (!!name && name.length > 1 && overColumn >= -1) {
      switch (name) {
        case ADDCOLUMNRIGHTAT:
          return (
            <AddColumnHighlighter
              style={{ marginLeft: (overColumn + 1) * 50 + 1 + "px" }}
            />
          );
        case DELETECOLUMNAT:
          return (
            <DeleteColumnHighlighter
              style={{ marginLeft: overColumn * 50 + 10 + "px" }}
            />
          );
      }
    }
    return;
  }, [gates.draggingGate, overColumn]);

  return <Wrapper qubits={qubits}>{highlighter}</Wrapper>;
}
