// Module imports
import styled from "@emotion/styled";

// Logic class imports
import { Quic } from "../../../logic/Quic.js";
import { useConfig } from "../../../hooks/useConfig.jsx";
import { useCircuitState } from "../../../hooks/useCircuitState.jsx";

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
 * @param {number} props.engineQubits - Number of qubits the engine is using.
 * @param {Object} props.gates - The gates object to update with QuICScript.
 * @param {boolean} props.displayInput - Whether to display the input.
 * @param {Function} props.triggerRun - Function to trigger run to Enter.
 * @param {Array} props.allowedGates - List of enabled gates
 * @returns {JSX.Element} The rendered component.
 */
export function QuicscriptInput({
  setCircuit,
  circuitQubits,
  qsManager,
  engineQubits,
  gates,
  displayInput,
  triggerRun,
}) {
  // Get config from context
  const { config } = useConfig();

  // Get circuit state from Redux store
  const circuit = useCircuitState(config);

  const handleCircuitChange = (e) => {
    const newCircuit = e.target.value;
    setCircuit(newCircuit);

    // Validate and update the visual representation
    const quicObj = new Quic(newCircuit, circuit.allowedGates).validate();
    if (quicObj) {
      gates.updateWithQuicscript(newCircuit);
    }
  };

  const handleKeyDown = ({ key }) =>
    key === "Enter" && triggerRun && triggerRun();

  if (!displayInput) return null;

  return (
    <Wrapper>
      <InputHolder
        placeholder="QuICScript circuit"
        autoComplete="off"
        value={circuit.displayCircuit}
        onChange={handleCircuitChange}
        onKeyDown={handleKeyDown}
      />
      <InputWrapperText style={{ display: displayInput ? "block" : "none" }}>
        Circuit using {circuitQubits} Qubits.{" "}
        {qsManager.started && (
          <span
            style={{
              display: "inline-block",
              color: circuitQubits != engineQubits ? "red" : "",
            }}
          >
            Engine started using ({circuitQubits}/{engineQubits} qubits)
          </span>
        )}
      </InputWrapperText>
    </Wrapper>
  );
}
