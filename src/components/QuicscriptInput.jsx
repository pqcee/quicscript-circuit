import styled from "@emotion/styled";
import { Quic } from "../logic/Quic.js";
import { beforeAfterDiff } from "../logic/Helper.js";
import { useMemo } from "react";
import { URLParamsManager } from "../logic/URLParamsManager.js";

const Wrapper = styled.div`
  padding: 8px;
  width: 100%;
`;

const InputHolder = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
`;

const InputWrapperText = styled.div`
  font-size: smaller;
  margin-left: 10px;
`;

/**
 * QuicscriptInput component handles the input for QuICScript circuits.
 * It updates the visualizer.
 *
 * @param {Object} props - The component props.
 * @param {string} props.circuit - The current QuICScript circuit.
 * @param {Function} props.setCircuit - Function to update the circuit state.
 * @param {number} props.circuitQubits - The number of qubits in the circuit.
 * @param {Object} props.qsManager - The QuICScript manager object.
 * @param {number} props.qubits - The total number of qubits available.
 * @param {Object} props.gates - The gates object to update with QuICScript.
 * @param {Function} props.setSkipTranslate - Function to set the skip translate state.
 * @returns {JSX.Element} The rendered component.
 */
export function QuicscriptInput({
  circuit,
  setCircuit,
  circuitQubits,
  qsManager,
  qubits,
  gates,
  setSkipTranslate,
  triggerRun,
  displayInput,
}) {
  function updateVisualiser(quicscript) {
    const quicObj = new Quic(quicscript).validate();
    if (quicObj) {
      gates.updateWithQuicscript(quicscript);
    } else {
      //TODO: Alert invalid quicscript
    }
  }

  const handleKeyDown = ({ key }) =>
    key === "Enter" && triggerRun && triggerRun();

  return (
    <Wrapper>
      <InputHolder
        placeholder="QuICScript circuit"
        autoComplete="off"
        value={circuit}
        onChange={({ target: { value: quicscript } }) => {
          let str = beforeAfterDiff(circuit, quicscript);
          setCircuit(quicscript);
          if (str.length == 1 && ["I", ","].includes(str)) return;
          setSkipTranslate(true);
          updateVisualiser(quicscript);
        }}
        onKeyDown={handleKeyDown}
        style={{ display: displayInput ? "block" : "none" }}
      />
      <InputWrapperText style={{ display: displayInput ? "block" : "none" }}>
        Circuit using {circuitQubits} Qubits.{" "}
        {qsManager.started ? (
          <div
            style={{
              display: "inline-block",
              color: circuitQubits != qubits ? "red" : "",
            }}
          >
            Engine started using ({circuitQubits}/{qubits} qubits)
          </div>
        ) : (
          ""
        )}
      </InputWrapperText>
    </Wrapper>
  );
}
