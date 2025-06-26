import { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { Gate } from "./Gate.jsx";
import { convertArrayToString } from "../logic/Converter.js";
import { Gates } from "../logic/Gates.js";
import { BuilderBoard } from "./BuilderBoard.jsx";
import { ActionHolder } from "./ActionHolder.jsx";
import { QuICScriptManager } from "../logic/QuICScriptManager.js";
import { allowedGates } from "../logic/Helper.js";
import { ColumnModifierHolder } from "./ColumnModifierHolder.jsx";
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
 * @param {Gates} props.gates
 * @returns
 */
export function Builder({ gates }) {
  /**
   * @type {[string[][],useStateCallback]} getGateSlots
   */
  const [getGateSlots, setGateSlots] = useState(gates.gateSlots);
  const [circuit, setCircuit] = useState("");
  const [skipTranslate, setSkipTranslate] = useState(false);

  const { stringResult, columns, qubits } = useMemo(() => {
    const stringResult = convertArrayToString(getGateSlots);
    if (skipTranslate) setSkipTranslate(false);
    else setCircuit(stringResult);
    return {
      stringResult,
      columns: getGateSlots[0].length,
      qubits: getGateSlots.length,
    };
  }, [getGateSlots]);

  useEffect(() => gates.observe(setGateSlots), []);

  const qsManager = useMemo(() => new QuICScriptManager(), []);

  const [runQuicResults, setRunQuicResults] = useState([]);

  const [updateSelect, setUpdateSelect] = useState(false);

  const [overColumn, setOverColumn] = useState(-2);

  return (
    <>
      <PaletteBuilderHolder>
        <LeftHolder>
          <GateHolder>
            <SectionHead>Gates & Operations</SectionHead>
            {allowedGates.map((gate) => (
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
          {...{
            getGateSlots,
            gates,
            qubits,
            runQuicResults,
            columns,
            updateSelect,
            setUpdateSelect,
            overColumn,
            setOverColumn,
          }}
        ></BuilderBoard>
      </PaletteBuilderHolder>
      <ActionHolder
        {...{
          circuit,
          setCircuit,
          gates,
          qsManager,
          setSkipTranslate,
          setRunQuicResults,
        }}
      />
    </>
  );
}
