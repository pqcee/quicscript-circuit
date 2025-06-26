import styled from "@emotion/styled";
import { ButtonHolder } from "./ButtonHolder.jsx";
import { useMemo, useState } from "react";
import { QuICScriptManager } from "../logic/QuICScriptManager.js";
import { StateResultHolder } from "./StateResultHolder.jsx";
import { stringToQubits } from "../logic/Helper.js";
import { Gates } from "../logic/Gates.js";
import { QuicscriptInput } from "./QuicscriptInput.jsx";
import { BarChartDisplay } from "./BarChartDisplay.jsx";
import { QiboResult } from "./QiboResult.jsx";
import { DisplayEquation } from "./DisplayEquation.jsx";
import { Config } from "../logic/Config.js";

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
 * @param {string} props.circuit - The current quantum circuit.
 * @param {Function} props.setCircuit - Function to update the circuit.
 * @param {Gates} props.gates - The gates object for managing circuit gates.
 * @param {QuICScriptManager} props.qsManager - The QuICScript manager instance.
 * @param {Function} props.setSkipTranslate - Function to set the skip translate visualiser to string.
 * @param {Function} props.setRunQuicResults - Function to set the run QuIC results state.
 * @param {number} props.qubits - The number of qubits in the circuit.
 * @returns {JSX.Element} The ActionHolder component.
 */
export function ActionHolder({
  circuit,
  setCircuit,
  gates,
  qsManager,
  setSkipTranslate,
  setRunQuicResults,
}) {
  const [results, setResults] = useState([]);
  const [qubits, setQubits] = useState(0);
  const [qiboString, setQiboString] = useState("");
  const [quicEquationResult, setQuicEquationResult] = useState();

  const circuitQubits = useMemo(() => stringToQubits(circuit), [circuit]);

  const { displayQibo, displayInput } = useMemo(() => {
    const { qibo, displayInput } = Config.getConfig();
    return {
      displayQibo: qibo,
      displayInput,
    };
  }, []);

  const disabledRun = useMemo(
    () => circuitQubits == 0 || (qsManager.started && circuitQubits != qubits),
    [circuitQubits, qubits, qsManager.started]
  );

  const buttons = [
    {
      name: "Run",
      disabled: disabledRun,
      func: () => {
        if (qsManager.started) {
          if (qubits != circuitQubits) {
            console.log(
              "Qubit count not consistent. Recommend restart QuICScript"
            );
            //TODO: Display and let user know
            return;
          }
        } else if (!qsManager.start(circuitQubits)) {
          console.error("Failed to start engine");
          //TODO: Display Engine Fail
          return;
        }
        qsManager.runQuICSimulator(circuit, gates);
        const qsResult = qsManager.getResults();
        setRunQuicResults(qsManager.runQuicResults);
        qsManager.stop();

        // For DisplayEquation
        if (qsManager.quicEquationResults?.length > 0) {
          setQuicEquationResult(qsManager.quicEquationResults);
        }

        setResults(JSON.parse(JSON.stringify(qsResult.results)));
        setQubits(qsResult.qubits);
      },
    },
    {
      name: "Qibo",
      display: displayQibo,
      disabled: disabledRun,
      func: () => setQiboString(qsManager.runGenerateQibo(circuit, gates)),
    },
    {
      name: "Reset",
      func: () => {
        qsManager.stop();
        setResults([]);
        gates.clearCircuit();
        setQiboString("");

        // If exist in index.html
        if (typeof callback_reset !== "undefined") callback_reset();
      },
    },
    // {
    //   name: "Refresh",
    //   func: () => gates.clearCircuit(),
    // },
  ];

  const displayBarChart = useMemo(() => {
    //TODO: Check if delimiter is not _
    if (results.length > 0) {
      const result = results[0].result;
      const splitResults = result.split("\n");
      const qubits = splitResults[0].slice(0, -1).split(",")[0].length;
      const numOfStates = Math.pow(2, qubits);
      const resultMap = Array(numOfStates).fill(0);
      splitResults.forEach((str) => {
        const [state, prob] = str.slice(0, -2).split(",");
        resultMap[parseInt(state, 2)] = prob / 100;
      });
      return <BarChartDisplay results={resultMap} qubits={qubits} />;
    }
    return <div></div>;
  }, [results]);

  const stateResult = <StateResultHolder {...{ results, qubits }} />;

  const runButton = buttons[0];

  return (
    <Wrapper>
      <QuicscriptInput
        {...{
          circuit,
          setCircuit,
          circuitQubits,
          qsManager,
          qubits,
          gates,
          setSkipTranslate,
          displayInput,
        }}
        triggerRun={() => !runButton.disabled && runButton.func()}
      />
      <StateActionHolder>
        {qubits > 4 ? (
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
          {results.length > 0 && qubits <= 4 && stateResult}
        </div>
        {qiboString && <QiboResult qiboString={qiboString} />}
      </StateActionHolder>
    </Wrapper>
  );
}
