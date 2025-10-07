// Module imports
import styled from "@emotion/styled";
import { useMemo, useState, useEffect, useCallback } from "react";

// Logic class imports
import { QuICScriptManager } from "../../../logic/QuICScriptManager.js";
import { Gates } from "../../../logic/Gates.js";

// Redux imports
import { useConfig } from "../../../hooks/useConfig.jsx";
import { useCircuitState } from "../../../hooks/useCircuitState.jsx";

// Helper imports
import { stringToQubits } from "../../../logic/Helper.js";

// Component imports
import { ButtonHolder } from "../../ui/ButtonHolder.jsx";
import { StateResultHolder } from "./StateResultHolder.jsx";
import { QuicscriptInput } from "./QuicscriptInput.jsx";
import { BarChartDisplay } from "./BarChartDisplay.jsx";
import { QiboResult } from "./QiboResult.jsx";
import { DisplayEquation } from "./DisplayEquation.jsx";

const Wrapper = styled.div`
  margin-top: 20px;
  padding: 0px 50px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButtonHolder = styled.div`
  display: grid;
  column-gap: 10px;
`;

const StateActionHolder = styled.div`
  display: grid;
  grid-auto-rows: 1fr;
  grid-template-columns: 1fr auto 1fr;
  width: 100%;
  column-gap: 20px;
  margin-bottom: 20px;
`;

/**
 * ActionHolder component handles the main actions for running and managing the quantum circuit.
 *
 * @param {Object} props - The properties object.
 * @param {Function} props.setRawInputCircuit - Function to update raw input.
 * @param {Gates} props.gates - The gates object for managing circuit gates.
 * @param {QuICScriptManager} props.qsManager - The QuICScript manager instance.
 * @param {Function} props.setRunQuicResults - Function to set the run QuIC results state.
 * @param {Function} props.onReset - Callback for reset action
 * @returns {JSX.Element} The ActionHolder component.
 */
export function ActionHolder({
  setRawInputCircuit,
  gates,
  qsManager,
  setRunQuicResults,
  onReset,
}) {
  // Get config from context hook
  const { config } = useConfig();

  // Get circuit state from Redux store
  const circuit = useCircuitState(config);

  // Get display booleans from config
  const displayQibo = config.display?.showQiboTranslation;
  const displayInput = config.display?.showCircuitInput;

  // Local state
  const [results, setResults] = useState([]);
  const [engineQubits, setEngineQubits] = useState(0);
  const [qiboString, setQiboString] = useState("");
  const [quicEquationResult, setQuicEquationResult] = useState();

  // Clear all results when resultsResetKey changes
  useEffect(() => {
    setResults([]);
    setQiboString("");
    setQuicEquationResult(undefined);
    setEngineQubits(0);
    qsManager.stop(); // Also stop the engine
  }, [circuit.resultsResetKey]);

  // Use processed circuit for calculations and execution
  const circuitQubits = useMemo(
    () => stringToQubits(circuit.displayCircuit),
    [circuit.displayCircuit]
  );

  const disabledRun = useMemo(
    () =>
      circuitQubits === 0 ||
      (qsManager.started && circuitQubits !== engineQubits),
    [circuitQubits, engineQubits, qsManager.started]
  );

  const handleRun = useCallback(async () => {
    if (!circuit.displayCircuit || circuitQubits === 0) {
      console.warn("No valid circuit to run");
      return;
    }

    if (qsManager.started) {
      if (engineQubits !== circuitQubits) {
        console.warn(
          "Qubit count not consistent. Recommend restart QuICScript"
        );
        // TODO: Display error to user
        return;
      }
    } else if (!qsManager.start(circuitQubits)) {
      console.error("Failed to start engine");
      // TODO: Display Engine Fail
      return;
    }

    qsManager.runQuICSimulator(circuit.displayCircuit, gates);
    const qsResult = qsManager.getResults();
    setRunQuicResults(qsManager.runQuicResults);
    qsManager.stop();

    // For DisplayEquation
    if (qsManager.quicEquationResults?.length > 0) {
      setQuicEquationResult(qsManager.quicEquationResults);
    }

    setResults(JSON.parse(JSON.stringify(qsResult.results)));
    setEngineQubits(qsResult.qubits);
  }, [circuit.displayCircuit, circuitQubits]);

  const handleQibo = () => {
    setQiboString(qsManager.runGenerateQibo(circuit.displayCircuit, gates));
  };

  const handleReset = () => {
    qsManager.stop();
    setResults([]);
    setQiboString("");
    setQuicEquationResult(undefined);
    setEngineQubits(0);

    // Call the parent's reset handler
    if (onReset) {
      onReset();
    }
  };

  const buttons = [
    {
      name: "Run",
      disabled: disabledRun,
      func: handleRun,
    },
    {
      name: "Qibo",
      display: displayQibo,
      disabled: disabledRun,
      func: handleQibo,
    },
    {
      name: "Reset",
      func: handleReset,
    },
  ];

  const displayBarChart = useMemo(() => {
    //TODO: Check if delimiter is not _
    if (results.length > 0) {
      const result = results[0].result;
      const splitResults = result.trim().split("\n");

      // Determine if states are binary or decimal
      const stateStrings = splitResults.map((line) =>
        line.split(",")[0].trim()
      );
      const isBinary = stateStrings.every((state) => /^[01]+$/.test(state));

      // Infer number of qubits
      let qubits;
      if (isBinary) {
        qubits = splitResults[0].split(",")[0].length;
      } else {
        const maxState = Math.max(
          ...splitResults.map((str) => parseInt(str.split(",")[0], 10))
        );
        qubits = Math.ceil(Math.log2(maxState + 1));
      }

      const numOfStates = Math.pow(2, qubits);
      const resultMap = Array(numOfStates).fill(0);

      splitResults.forEach((str) => {
        const [stateStr, probStr] = str.replace("%;", "").split(",");
        const index = isBinary ? parseInt(stateStr, 2) : parseInt(stateStr, 10);
        resultMap[index] = parseFloat(probStr) / 100;
      });

      return <BarChartDisplay results={resultMap} qubits={qubits} />;
    }
    return <div></div>;
  }, [results]);

  const stateResult = (
    <StateResultHolder results={results} qubits={engineQubits} />
  );
  const runButton = buttons[0];

  return (
    <Wrapper>
      <QuicscriptInput
        setCircuit={setRawInputCircuit}
        circuitQubits={circuitQubits}
        qsManager={qsManager}
        engineQubits={engineQubits}
        gates={gates}
        displayInput={displayInput}
        triggerRun={() => !runButton.disabled && runButton.func()}
      />
      <StateActionHolder>
        {engineQubits > 4 ? (
          stateResult
        ) : results.length > 0 ? (
          <div>
            {displayBarChart}
            {<DisplayEquation quicEquationResult={quicEquationResult} />}
          </div>
        ) : (
          <div></div>
        )}
        <div>
          <ActionButtonHolder>
            {buttons.map(({ name, func, disabled, display }) => (
              <ButtonHolder
                key={name}
                onClick={func}
                style={{
                  gridRow: 1,
                  alignSelf: "start",
                  display: display == false ? "none" : "block",
                }}
                disabled={disabled}
              >
                {name}
              </ButtonHolder>
            ))}
          </ActionButtonHolder>
          {results.length > 0 && engineQubits <= 4 && stateResult}
        </div>
        {qiboString && <QiboResult qiboString={qiboString} />}
      </StateActionHolder>
    </Wrapper>
  );
}
