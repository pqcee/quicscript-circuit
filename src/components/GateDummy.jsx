import { Gates } from "../logic/Gates.js";
import styled from "@emotion/styled";
import { useMemo } from "react";
import { Measure } from "./assets/Measure.jsx";
import { UGate } from "./UGate.jsx";

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-sizing: border-box;
  z-index: 11;
`;

const WrapperBox = styled(Wrapper)`
  width: 40px;
  height: 40px;
  border: 1px solid #d1d5db;
  background-color: #f3f4f6;
`;

const WrapperBoxEmpty = styled(Wrapper)`
  width: 40px;
  height: 40px;
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
export function GateDummy({ gate }) {
  const gateElement = useMemo(() => {
    switch (gate) {
      case "m":
        return <Measure />;
      case "U":
        return <UGate disable={true} />;
      case "C":
        return <CGate></CGate>;
      case "N":
        return <NGate></NGate>;
      case "s":
        return <SWAPGate></SWAPGate>;
      default:
        return gate;
    }
  }, [gate]);

  return gateElement ? (
    <WrapperBox>{gateElement}</WrapperBox>
  ) : (
    <WrapperBoxEmpty />
  );
}
