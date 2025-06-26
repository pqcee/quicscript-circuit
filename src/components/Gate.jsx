import { useDrag } from "../logic/Dnd.js";
import GateModel from "../models/GateModel";
import { Gates } from "../logic/Gates.js";
import styled from "@emotion/styled";
import { useEffect, useMemo } from "react";
import { Measure } from "./assets/Measure.jsx";
import { UGate } from "./UGate.jsx";

export const GateSize = {
  width: 40,
  height: 40,
};

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-sizing: border-box;
  z-index: 11;
`;

const WrapperBox = styled(Wrapper)`
  border: 1px solid #d1d5db;
  background-color: #f3f4f6;
`;

const CGate = styled.div`
  height: 12px;
  width: 12px;
  background-color: #000;
  border-radius: 50%;
  display: inline-block;
`;

const NGate = styled.div`
  height: 18px;
  width: 18px;
  background-color: #fff;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  border: 2px solid #000;
  &:after {
    content: " ";
    display: block;
    height: 0;
    box-sizing: border-box;
    margin: 8px 0;
    border-bottom: 2px solid #000;
  }
  &:before {
    content: " ";
    display: block;
    height: 100%;
    box-sizing: border-box;
    position: absolute;
    left: 8px;
    border-left: 2px solid #000;
  }
`;

const SWAPGate = styled.div`
  width: 100%;
  position: relative;
  &:after {
    position: absolute;
    width: 100%;
    transform: rotate(45deg);
    content: " ";
    display: block;
    height: 0;
    box-sizing: border-box;
    margin: 8px 0;
    border-bottom: 2px solid #000;
    top: -8px;
  }

  &:before {
    position: absolute;
    width: 100%;
    transform: rotate(-45deg);
    content: " ";
    display: block;
    height: 0;
    box-sizing: border-box;
    margin: 8px 0;
    border-bottom: 2px solid #000;
    top: -8px;
  }
`;

/**
 * Gate component
 * @param {Object} props - Props of component
 * @param {number} props.qubit - The qubit the gate belong to
 * @param {number} props.column - The column the gate belong to
 * @param {string} props.gate - The gate name
 * @param {Gates} props.gates - The gates manager
 */
export function Gate({ qubit, column, gate, gates, controlledHighlight }) {
  const [{ isDragging }, drag] = useDrag(
    (q, c) => gates.moveGate(q, c),
    () => gates.deleteGate(),
    () => gates.selector.cancelSelection(),
    false
  );

  const onBuilder = useMemo(
    () => qubit != null || column != null,
    [qubit, column]
  );

  /**
   * Highlight the gate if gate is part of controlled gates and also if there is a pair
   * Commented out at #48 as requested by NUS and approve by Teik guan
   */
  //   const hightlight = useMemo(
  //     () =>
  //       controlledHighlight && controlledGatesWithC.includes(gate)
  //         ? { borderColor: "red" }
  //         : {},
  //     [controlledHighlight, gate]
  //   );

  useEffect(() => {
    if (isDragging == true) {
      gates.setDraggingGate(new GateModel(gate, qubit, column));
    }
  }, [isDragging]);

  const gateElement = useMemo(() => {
    switch (gate) {
      case "m":
        return <Measure />;
      case "U":
        return <UGate disable={column == null} column={column} gates={gates} />;
      case "C":
        return <CGate></CGate>;
      case "N":
        return <NGate></NGate>;
      case "s":
        return <SWAPGate></SWAPGate>;
      case "x":
        return "Rx";
      case "y":
        return "Ry";
      case "z":
        return "Rz";
      default:
        return gate;
    }
  }, [gate]);

  if (["C", "N", "s"].includes(gate) && onBuilder) {
    return (
      <Wrapper
        ref={drag}
        style={{
          opacity: isDragging ? 0.5 : 1,
          ...GateSize,
        }}
      >
        {gateElement}
      </Wrapper>
    );
  }

  return (
    <WrapperBox
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        ...GateSize,
        // ...hightlight,
      }}
      className="gate"
    >
      {gateElement}
    </WrapperBox>
  );
}
