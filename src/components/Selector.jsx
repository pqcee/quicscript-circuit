import { COPYSELECTOR, Gates, MOVESELECTOR } from "../logic/Gates";
import styled from "@emotion/styled";
import { ToolTip } from "./ToolTip";
import { useDrag } from "../logic/Dnd";
import { useEffect, useMemo, useState } from "react";
import GateModel from "../models/GateModel";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import HighlightAltIcon from "@mui/icons-material/HighlightAlt";

export const COPY = "Copy";
export const MOVE = "Move";
const icon = {
  [COPY]: (color) => <CopyAllIcon sx={{ color, fontSize: 20 }} />,
  [MOVE]: (color) => <HighlightAltIcon sx={{ color, fontSize: 20 }} />,
};

const HighlightBox = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-sizing: border-box;
  border-radius: 100%;
  background-color: ${(props) => props.modeColor};

  height: 40px;
  width: 40px;
`;

const HalfHighlight = styled(HighlightBox)`
  background-color: transparent;
  border: 1.5px dotted grey;

  &:before {
    content: "";
    height: 20px;
    width: 40px;
    display: block;
    position: absolute;
    bottom: 0;
    background-color: ${(props) => props.modeColor};
    border-radius: 0 0 20px 20px;
  }

  &:after {
    height: 12px;
    width: 12px;
    border: 1.5px dotted white;
  }
`;

const UsedHighlight = styled(HighlightBox)`
  background-color: transparent;
  border: 1.5px dotted grey;
  cursor: not-allowed;
`;

const SelectBox = styled.div`
  height: 12px;
  width: 12px;
  border: 1.5px dotted ${(props) => props.color};
`;

const BottomHalf = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  position: absolute;
  bottom: 0;
  height: 20px;
  overflow: hidden;
  width: 40px;

  > svg {
    top: -9px;
    position: absolute;
  }
`;

const CancelHighlight = styled.div`
  position: absolute;
  top: 0;
  height: 40px;
  width: 40px;
  border-radius: 100%;
  cursor: pointer;
`;

export const modeColors = {
  [COPY]: "rgba(251, 191, 36,1)", //#fbbf24
  [MOVE]: "rgba(119,81,239,1)", //#7751EF
};

/**
 * @param {Object} props
 * @param {Gates} props.gates
 * @param {Function} props.setUpdateSelect
 * @param {string} props.mode
 * @returns
 */
export function Selector({ gates, setUpdateSelect, mode }) {
  const modeColor = modeColors[mode];

  const [{ isDragging }, drag] = useDrag(
    (q, c) => gates.moveGate(q, c),
    () => {},
    () => {
      if (mode + " Selector" != gates.draggingGate.name)
        gates.selector.cancelSelection();
    },
    false
  );

  useEffect(() => {
    if (isDragging == true) {
      if (mode == COPY) gates.setDraggingGate(new GateModel(COPYSELECTOR));
      else if (mode == MOVE) gates.setDraggingGate(new GateModel(MOVESELECTOR));
    }
  }, [isDragging]);

  const [cancel, setCancel] = useState(false);

  const display = useMemo(() => {
    if (gates.selector.currentMode == mode) {
      switch (gates.selector.stepper) {
        case 1:
          return (
            <HalfHighlight modeColor={modeColor}>
              {icon[mode]("black")}
              <BottomHalf>{icon[mode]("white")}</BottomHalf>
            </HalfHighlight>
          );
        case 2:
          setCancel(true);
          return <UsedHighlight>{icon[mode]("black")}</UsedHighlight>;
      }
    }
    setCancel(false);
    return (
      <HighlightBox modeColor={modeColor}>{icon[mode]("white")}</HighlightBox>
    );
  }, [gates.selector.stepper, gates.selector.currentMode]);

  function clickCancel() {
    gates.selector.clear();
    setCancel(false);
    setUpdateSelect(true);
  }

  return (
    <ToolTip text={cancel ? "Cancel Selector" : mode + " Selector"}>
      {cancel && <CancelHighlight onClick={clickCancel}></CancelHighlight>}
      <div ref={drag}>{display}</div>
    </ToolTip>
  );
}
