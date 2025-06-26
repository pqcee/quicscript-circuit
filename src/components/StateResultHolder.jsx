import styled from "@emotion/styled";
import { CopyButton } from "./CopyButton";

const Wrapper = styled.div`
  margin-top: 10px;
  > div {
    width: fit-content;
    margin: 0 auto;
  }
`;

const TextHolder = styled.span`
  display: block;
`;

/**
 * StateResultHolder component displays the results of a quantum computation.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.results - The results of the quantum computation. { quicscript: string, result: string }[]
 * @param {number} props.qubits - The number of qubits used in the computation.
 * @returns {JSX.Element} The rendered component.
 */
export function StateResultHolder({ results, qubits }) {
  if (results.length == 0) return <div></div>;

  const resultsOut = results
    .map(({ _, result }) => {
      const arr = result.split("\n").filter((a) => a);
      arr.push("---");
      return arr;
    })
    .reverse();

  return (
    <Wrapper>
      <div>
        <CopyButton copyText={results[0]?.result} style={{ float: "right" }} />
        {resultsOut.map((arr) =>
          arr.map((str, i) => <TextHolder key={i}>{str}</TextHolder>)
        )}
        <TextHolder>State is reset, working on {qubits} Qubits</TextHolder>
      </div>
    </Wrapper>
  );
}
