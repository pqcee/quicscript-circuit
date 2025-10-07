// Module imports
import styled from "@emotion/styled";
import { useMemo } from "react";
import { useConfig } from "../../../hooks/useConfig.jsx";

// Component imports
import { Measure } from "../../assets/Measure.jsx";

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
 * @param {string} props.gate - The gate name
 */
export function GateDummy({ gate }) {
  const { config } = useConfig();

  const gateElement = useMemo(() => {
    if (!config.display?.useCustomGates) {
      return gate;
    } else if (config.circuitOptions?.useMultishotMeasurementGate) {
      switch (gate) {
        case "C":
          return <CGate />;
        case "N":
          return <NGate />;
        case "s":
          return <SWAPGate />;
        case "M":
          return <Measure />;
        default:
          return gate;
      }
    } else {
      switch (gate) {
        case "C":
          return <CGate />;
        case "N":
          return <NGate />;
        case "s":
          return <SWAPGate />;
        case "m":
          return <Measure />;
        default:
          return gate;
      }
    }
  }, [gate]);

  return gateElement ? (
    <WrapperBox>{gateElement}</WrapperBox>
  ) : (
    <WrapperBoxEmpty />
  );
}
