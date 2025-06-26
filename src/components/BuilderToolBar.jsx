import styled from "@emotion/styled";
import { ButtonHolder } from "./ButtonHolder.jsx";
import { DustbinGate } from "./DustbinGate.jsx";
import { maxQubits } from "../logic/Gates.js";
import { useMemo } from "react";

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
