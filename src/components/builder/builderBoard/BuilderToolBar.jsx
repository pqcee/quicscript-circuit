// Module imports
import styled from "@emotion/styled";
import { useMemo } from "react";

// Logic class imports
import { maxQubits } from "../../../logic/Gates.js";

// Component imports
import { ButtonHolder } from "../../ui/ButtonHolder.jsx";
import { DustbinGate } from "./DustbinGate.jsx";

const Wrapper = styled.div`
  display: flex;
  position: sticky;
  left: 0;
  height: 50px;
`;

export function BuilderToolBar({ gates, qubits }) {
  const disableAddQubit = useMemo(() => qubits >= maxQubits, [qubits]);

  return (
    <Wrapper>
      <ButtonHolder onClick={() => gates.addQubit()} disabled={disableAddQubit}>
        Add Qubit
      </ButtonHolder>
      <DustbinGate gates={gates} />
    </Wrapper>
  );
}
