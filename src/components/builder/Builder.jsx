// Module imports
import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import { useSelector } from "react-redux";

// Logic class imports
import { Gates } from "../../logic/Gates.js";
import { QuICScriptManager } from "../../logic/QuICScriptManager.js";

// Redux imports
import { useConfig } from "../../hooks/useConfig.jsx";
import {
  selectCircuitDimensions,
  selectGateSlots,
} from "../../store/selectors.js";
import { useCircuitState } from "../../hooks/useCircuitState.jsx";

// Component imports
import { Gate } from "./gate/Gate.jsx";
import { BuilderBoard } from "./builderBoard/BuilderBoard.jsx";
import { ActionHolder } from "./actionHolder/ActionHolder.jsx";
import { ColumnModifierHolder } from "./columnModifier/ColumnModifierHolder.jsx";
import { GateTooltip } from "./GateTooltip.jsx";

const GateHolder = styled.div`
  display: flex;

  flex-wrap: wrap;

  column-gap: 10px;

  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  row-gap: 10px;
`;

const LeftHolder = styled.div`
  max-width: 160px;
  min-width: 120px;

  border: 2px solid #d1d5db;
  border-bottom: none;
  height: fit-content;
  margin: auto 0px;

  > div {
    padding: 10px;
    border-bottom: 2px solid #d1d5db;
  }
`;

const PaletteBuilderHolder = styled.div`
  display: flex;
  margin: 0 20px;
  justify-content: center;
  column-gap: 5px;

  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
`;

const SectionHead = styled.div`
  text-align: center;
  position: relative;
  line-height: 24px;
`;

/**
 *
 * @param {Object} props
 * @param {Gates} props.gates - The gates instance
 * @param {Function} props.onRawInputChange - Handle text input changes
 * @param {Function} props.onReset - Callback for reset action
 */
const Builder = ({ gates, onRawInputChange, onReset }) => {
  // Get visual state directly from Redux - no more useState or useEffect!
  const gateSlots = useSelector(selectGateSlots);
  const { columns, qubits } = useSelector(selectCircuitDimensions);

  // Pull config object from context
  const { config } = useConfig();

  // Get circuit state from Redux store
  const circuit = useCircuitState(config);

  // QuICScript manager for running circuits
  const qsManager = useMemo(
    () => new QuICScriptManager(config.display?.resultDelimiter),
    [config.display?.resultDelimiter]
  );

  // Local state for UI interactions
  const [runQuicResults, setRunQuicResults] = useState([]);
  const [updateSelect, setUpdateSelect] = useState(false);
  const [overColumn, setOverColumn] = useState(-2);

  // Simple event handler - just pass through to App
  const handleTextInputChange = (newRawInput) => {
    onRawInputChange(newRawInput);
  };

  return (
    <>
      <PaletteBuilderHolder>
        <LeftHolder>
          <GateHolder>
            <SectionHead>Gates & Operations</SectionHead>
            {circuit.allowedGates?.map((gate) => (
              <GateTooltip key={gate} gate={gate}>
                <Gate gate={gate} gates={gates} />
              </GateTooltip>
            ))}
          </GateHolder>
          <div>
            <SectionHead>Modifiers</SectionHead>
            <ColumnModifierHolder
              gates={gates}
              setUpdateSelect={setUpdateSelect}
              setOverColumn={setOverColumn}
            />
          </div>
        </LeftHolder>
        <BuilderBoard
          getGateSlots={gateSlots}
          gates={gates}
          qubits={qubits}
          runQuicResults={runQuicResults}
          columns={columns}
          updateSelect={updateSelect}
          setUpdateSelect={setUpdateSelect}
          overColumn={overColumn}
          setOverColumn={setOverColumn}
        />
      </PaletteBuilderHolder>
      <ActionHolder
        setRawInputCircuit={handleTextInputChange}
        gates={gates}
        qsManager={qsManager}
        setRunQuicResults={setRunQuicResults}
        onReset={onReset}
      />
    </>
  );
};

export default Builder;
