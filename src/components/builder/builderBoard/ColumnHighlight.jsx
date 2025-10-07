// Module imports
import styled from "@emotion/styled";

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

const ColumnHighlighter = styled.div`
  background-color: ${(props) => props.color};
  width: 40px;
  margin: 0 1px;
  margin-left: 10px;
  opacity: 0.7;
  margin-left: ${(props) => props.marginLeft};
`;

/**
 * ColumnHighlight component highlights the column/qubit index to specified color.
 * @param {Object} props - The component props.
 * @param {number} props.overColumn - The column/qubit index to highlight.
 * @param {number} props.qubits - The number of qubits determins the height of the highlighter.
 * @param {string} props.color - The color of the highlighter.
 * @returns
 */
export function ColumnHighlight({ overColumn, qubits, color }) {
  return (
    <Wrapper qubits={qubits}>
      <ColumnHighlighter
        marginLeft={overColumn * 50 + 10 + "px"}
        color={color}
      />
    </Wrapper>
  );
}
