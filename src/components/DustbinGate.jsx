import styled from "@emotion/styled";
import { GateSize } from "./Gate";
import { Gates } from "../logic/Gates";
import { useEffect, useState } from "react";
import { useDrop } from "../logic/Dnd";

const Wrapper = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  margin: 5px;
  border-style: dashed;
  justify-content: center;
  display: flex;
  border: 1px solid #d1d5db;
  align-items: center;
  justify-content: center;
  cursor: help;
  box-sizing: border-box;
  border-style: dashed;
`;

const red = "#f64740";

/**
 *
 * @param {object} props
 * @param {Gates} props.gates
 * @returns
 */
export function DustbinGate({ gates }) {
  const [mouseOver, setMouseOver] = useState(false);
  const [{ isOver }, drop] = useDrop(() => gates.deleteGate());

  useEffect(() => setMouseOver(isOver), [isOver]);

  return (
    <Wrapper
      style={{ ...GateSize, backgroundColor: mouseOver ? red : "white" }}
      ref={drop}
      data-bin="true"
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
    >
      {/* https://iconscout.com/free-icon/trash-169 */}
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" id="trash">
        <g
          fill="none"
          fillRule="evenodd"
          stroke={mouseOver ? "white" : red}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          id="bin"
        >
          <path d="M1 5h18M17 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5m3 0V3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M8 10v6M12 10v6"></path>
        </g>
      </svg>
    </Wrapper>
  );
}
