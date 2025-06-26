import styled from "@emotion/styled";
import { BarChart } from "@mui/x-charts";
import { useEffect, useMemo, useRef, useState } from "react";

const Wrapper = styled.div`
  width: 100%;
  overflow: hidden;
  margin-top: -25px;
  > div {
    height: 180px;
    margin-bottom: 20px;
  }
`;

/**
 * BarChartDisplay component renders a bar chart to display quantum state probabilities.
 *
 * @param {Object} props - The properties object.
 * @param {number[]} props.results - The results array containing quantum state state and probabilities.
 * @param {number} props.qubits - The number of qubits in the circuit.
 * @returns {JSX.Element} The BarChartDisplay component.
 */
export function BarChartDisplay({ results, qubits }) {
  const ref = useRef();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (ref.current) setWidth(ref.current.offsetWidth);
  }, []);

  const states = useMemo(() => {
    return [...new Array(Math.pow(2, qubits)).fill(0)].map(
      (_, i) => `|${i.toString(2).padStart(qubits, 0)}>`
    );
  }, [qubits]);

  const { backgroundColor } = useMemo(() => {
    const firstGate = document.getElementsByClassName("gate")[0];
    if (!firstGate) {
      console.error("No element with 'gate' class found in the document.");
      return { backgroundColor: "#ededed" };
    } else return getComputedStyle(firstGate);
  }, []);

  return (
    <Wrapper ref={ref}>
      <BarChart
        style={{ width }}
        xAxis={[
          {
            scaleType: "band",
            data: states,
            tickLabelStyle: {
              angle: -90,
              textAnchor: "end",
              fontSize: 12,
            },
          },
        ]}
        series={[
          {
            data: results,
            valueFormatter: (v) => v * 100 + "%",
          },
        ]}
        yAxis={[{ max: 1, min: 0, label: "Probability" }]}
        colors={[backgroundColor]} //TODO: Get colors from index.html
        width={800}
        height={300}
      />
    </Wrapper>
  );
}
