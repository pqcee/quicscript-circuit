import styled from "@emotion/styled";
import { GateSize } from "./Gate.jsx";
import { Slot } from "./Slot.jsx";
import React, { useEffect, useMemo, useState } from "react";
import {
  processColumnForControlled,
  processColumnForSwap,
} from "../logic/Helper.js";
import { rowsToColumns } from "../logic/Converter.js";
import { Gates } from "../logic/Gates.js";
import { SliderHolder } from "./SliderHolder.jsx";
import { Highlight } from "./Highlight.jsx";
import { BuilderToolBar } from "./BuilderToolBar.jsx";
import { ColumnHighlight } from "./ColumnHighlight.jsx";
import { GateDummy } from "./GateDummy.jsx";
import { TOUCH, useDrag } from "../logic/Dnd.js";
import GateModel from "../models/GateModel.js";
import { InitialColumn } from "./InitialColumn.jsx";

const Wrapper = styled.div`
  width: fit-content;
  border: 2px solid #fbbf24;
  // margin: auto;
  padding: 10px;
  overflow-x: auto;
  position: relative;
`;

const RowHolder = styled.div`
  display: flex;
  width: fit-content;
  align-items: center;
`;

const QubitText = styled.div`
  text-align: center;
  margin: auto;
  display: flex;
`;

const DeleteButtomHolder = styled.div`
  margin-left: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DeleteButtom = styled.button`
  border: none;
  border-radius: 4px;
  color: white;
  background-color: #ff4d4d;
  border: 3px solid #ff4d4d;
  cursor: pointer;
`;

const QubitRow = styled.div`
  display: flex;
  position: relative;
  width: fit-content;
  &:after {
    position: absolute;
    width: 100%;
    top: 23px;
    height: 2px;
    background-color: #d1d5db;
    z-index: -2;
    content: "";
  }
`;

const SelectionDiv = styled.div`
  position: relative;
`;

const SelectionHolder = styled.div`
  position: absolute;
  top: 4px;
  left: 5px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  z-index: 1;
`;

const SelectionRow = styled.div`
  justify-content: center;
  cursor: not-allowed;
  display: flex;
  column-gap: 10px;
  margin-bottom: 8px;
  opacity: 0.5;
  z-index: 2;
`;

/**
 * BuilderBoard component renders a visual representation of a quantum circuit builder.
 * It allows users to add and delete qubits, and displays the gates and their connections.
 *
 * @param {Object} props - The properties object.
 * @param {string[][]} props.getGateSlots - A 2D array representing the gate slots for each qubit.
 * @param {Gates} props.gates - An instance of the Gates class containing gate-related logic.
 * @param {number} props.qubits - The number of qubits in the circuit.
 * @param {string[]} props.runQuicResults - The results of running the quantum circuit.
 * @param {number} props.columns - The number of columns in the circuit.
 * @returns {JSX.Element} The rendered BuilderBoard component.
 */
export function BuilderBoard({
  getGateSlots,
  gates,
  qubits,
  runQuicResults,
  columns,
  updateSelect,
  setUpdateSelect,
  overColumn,
  setOverColumn,
}) {
  const [updateMouse, setUpdateMouse] = useState(false);
  const [errorColumns, setErrorColumns] = useState([]);

  const controlledArray = useMemo(() => {
    const columnsGates = rowsToColumns(getGateSlots);

    const calculatedArray = columnsGates.map((column) => {
      const controlled = processColumnForControlled(column);
      const swap = processColumnForSwap(column);
      return swap && !controlled ? swap : controlled;
    });

    // Check for stray C and S gates
    const gatesToCheck = ["C", "s"];
    const errorArray = [];
    columnsGates
      .map((column) => gatesToCheck.some((gate) => column.includes(gate)))
      .forEach(
        (c, index) => c && !calculatedArray[index] && errorArray.push(index)
      );

    setErrorColumns(errorArray);

    return calculatedArray;
  }, [getGateSlots]);

  const [select, setSelect] = useState(null);

  useEffect(() => {
    gates.selector.setCallbackUpdate(() => setUpdateSelect(true));
  }, []);

  const [selectionArea, setSelectionArea] = useState(null);

  useEffect(() => {
    if (updateSelect) {
      setUpdateSelect(false);
      setSelect(gates.selector.highlight);
    }
  }, [updateSelect]);

  useEffect(() => {
    if (gates.selector.stepper == 1) setUpdateMouse(true);
    else setUpdateMouse(false);
    setSelect(gates.selector.highlight);
  }, [gates.selector.stepper]);

  // useEffect(() => {
  //   console.log(select);
  // }, [select]);

  const topleft = useMemo(() => {
    return gates.selector.stepper == 2
      ? gates.selector.getTopLeftCorner()
      : null;
  }, [select]);

  const { tlqubit, tlcolumn } = topleft || {};

  function updateSelectionArea() {
    const { brqubit, brcolumn } = gates.selector.getBottomRightCorner();
    const width = brcolumn - tlcolumn + 1;
    const height = brqubit - tlqubit + 1;
    const arr = [];
    for (let i = tlqubit; i <= brqubit; i++) {
      arr.push(getGateSlots[i].slice(tlcolumn, brcolumn + 1));
    }

    function Selection() {
      const [{ isDragging }, drag] = useDrag(
        (q, c) => gates.moveGate(q, c),
        () => console.log("delete"),
        (qubit, column, type) => {
          if (type == TOUCH) {
            gates.selector.setDragCoordinates(0, 0);
          } else {
            const q = qubit - tlqubit;
            const c = column - tlcolumn;
            gates.selector.setDragCoordinates(q, c);
          }
        },
        true,
        gates.selector.currentMode
      );

      useEffect(() => {
        if (isDragging == true) {
          gates.setDraggingGate(new GateModel(gates.selector.currentMode));
          gates.selector.setSelectedGates(arr);
        }
      }, [isDragging]);

      return (
        <SelectionDiv ref={drag}>
          <SelectionHolder
            width={width * 40 + (width - 1) * 10}
            height={height * 40 + (height - 1) * 9}
          >
            {arr.map((row, q) => (
              <SelectionRow key={q}>
                {row.map((gate, c) => (
                  <GateDummy key={c} gate={gate}>
                    {gate}
                  </GateDummy>
                ))}
              </SelectionRow>
            ))}
          </SelectionHolder>
        </SelectionDiv>
      );
    }

    setSelectionArea(<Selection />);
  }

  useEffect(() => {
    if (topleft) updateSelectionArea();
  }, [topleft, getGateSlots]);

  const addRow = () => gates.addColumnAt(0);

  // Handle mouse movement inside the board
  const [inside, setInside] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const UPDATE_RATE = 20; // ms
  const [mouseOverX, setMouseOverX] = useState(null);
  const [mouseOverY, setMouseOverY] = useState(null);

  function handleUpdateMouseOver(x, y) {
    gates.selector.updateSelect(x, y);
  }

  function getElementXY(e) {
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    for (const element of elements) {
      if (element.dataset && element.dataset.x && element.dataset.y) {
        return { x: element.dataset.x, y: element.dataset.y };
      }
    }
    return { x: null, y: null };
  }

  function handleMouseMove(e) {
    if (updateMouse && inside && !blocking) {
      setBlocking(true);
      const { x, y } = getElementXY(e);
      if (x && (mouseOverX != x || mouseOverY != y)) {
        setMouseOverX(x);
        setMouseOverY(y);
        handleUpdateMouseOver(x, y);
      }
      setTimeout(() => setBlocking(false), UPDATE_RATE);
    }
  }

  useEffect(() => {
    if (!inside) {
      setMouseOverX(null);
      setMouseOverY(null);
      gates.selector.clearSelect();
    }
  }, [inside]);

  function handleMouseDown(e) {
    if (updateMouse) {
      const { x, y } = getElementXY(e);
      if (x) {
        gates.selector.confirmSelection(x, y);
        setUpdateMouse(false);
      }
    }
  }

  return (
    <Wrapper
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setInside(true)}
      onMouseLeave={() => setInside(false)}
      onMouseDown={handleMouseDown}
    >
      <Highlight qubits={qubits} overColumn={overColumn} gates={gates} />
      {errorColumns.map((qubit) => (
        <ColumnHighlight
          key={qubit}
          overColumn={qubit}
          qubits={qubits}
          color="#FFCAD4"
        />
      ))}

      <InitialColumn
        rows={getGateSlots.length}
        setOverColumn={setOverColumn}
        gates={gates}
      ></InitialColumn>

      {getGateSlots.map((row, qubit) => (
        <RowHolder key={qubit}>
          <QubitText style={GateSize}>
            <p style={{ margin: "auto" }}>q[{qubit}]:</p>
          </QubitText>
          <QubitRow>
            {row.map((gate, column) => (
              <React.Fragment key={column}>
                {topleft &&
                  tlqubit == qubit &&
                  tlcolumn == column &&
                  selectionArea}
                <Slot
                  selected={select && select[qubit] && select[qubit][column]}
                  key={qubit.toString() + "," + column.toString()}
                  {...{ qubit, column, gate, gates, setOverColumn }}
                  controlledHighlight={controlledArray[column] != null}
                  controlledDistance={
                    controlledArray[column] != null
                      ? controlledArray[column].first == qubit
                        ? controlledArray[column].last -
                          controlledArray[column].first
                        : 0
                      : 0
                  }
                />
              </React.Fragment>
            ))}
          </QubitRow>
          <DeleteButtomHolder style={GateSize}>
            <DeleteButtom onClick={() => gates.deleteQubit(qubit)}>
              X
            </DeleteButtom>
          </DeleteButtomHolder>
        </RowHolder>
      ))}
      <SliderHolder columns={columns} runQuicResults={runQuicResults} />
      <BuilderToolBar gates={gates} qubits={qubits} />
    </Wrapper>
  );
}
