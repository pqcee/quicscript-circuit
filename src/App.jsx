// Module imports
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import styled from "@emotion/styled";
import { DragDropProvider } from "./contexts/DragDropContext.jsx";
import { useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Alert, Button, Snackbar } from "@mui/material";

// Logic class imports
import { Gates } from "./logic/Gates.js";

// Redux and context imports
import { selectGateSlots } from "./store/selectors.js";
import { useCircuitState } from "./hooks/useCircuitState.jsx";
import { importCircuitFromFile } from "./store/thunks/circuitThunks.js";
import { setCircuitFromVisual } from "./store/circuitSlice.js";

// Helper imports
import { validateQuantumGatePattern } from "./logic/Helper.js";
import {
  convertArrayToString,
  convertStringToQibo,
} from "./logic/Converter.js";

// Component imports
import Builder from "./components/builder/Builder.jsx";
import FileUploadDownload, {
  handleDownloadFile,
} from "./components/selection/FileUploadDownload.jsx";
import BasicDialog from "./components/ui/BasicDialog.jsx";
import { ButtonHolder } from "./components/ui/ButtonHolder.jsx";

const FullscreenButton = styled.div`
  cursor: pointer;
  position: sticky;
  width: fit-content;
  padding: 0 10px;
  background-color: darkgrey;
  border-radius: 5px;
  color: white;
  font-size: 0.9em;
`;

const TopDiv = styled.div`
  display: flex;
  justify-content: space-between;
`;

const VersionDiv = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding-right: 5px;
  font-size: x-small;
  white-space: break-spaces;
  text-align: right;
`;

const CircuitSelector = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const SelectionDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 10px;
  margin-right: 10px;
`;

const SelectionRight = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
`;

export default function App({ config }) {
  // State for toggling fullscreen mode
  const [fullsceen, setFullscreen] = useState(false);

  // State for retrieving and setting URL search params
  const [searchParams, setSearchParams] = useSearchParams();

  // Pull state from Redux store
  const dispatch = useDispatch();
  const circuit = useCircuitState(config);

  // States for showing errors
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // State for showing Qibo submit success in MUI Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Get visual state from Redux to watch for changes
  const gateSlots = useSelector(selectGateSlots);

  // Flags to prevent feedback loops
  const isTextInputChange = useRef(false);
  const isUpdating = useRef(false);
  const lastChangeFromPreset = useRef(false); // For preset selections
  const lastChangeFromReset = useRef(false); // For reset operations
  const lastChangeFromFile = useRef(false); // For file imports
  const lastChangeFromUrl = useRef(false); // For url search

  // Create gates object with Redux dispatch
  const gates = useMemo(() => {
    return new Gates(
      config.defaultCircuit.qubits,
      config.defaultCircuit.columns,
      "",
      config,
      dispatch
    );
  }, [config, dispatch]);

  // Sync Redux displayCircuit to Gates (text input changes)
  useEffect(() => {
    if (circuit.displayCircuit !== undefined && !isUpdating.current) {
      gates.updateWithQuicscript(circuit.displayCircuit);
    }
  }, [circuit.displayCircuit, gates]);

  // Handle visual-to-text conversion with proper flags
  useEffect(() => {
    // Skip if we just processed a text input to prevent feedback
    if (isTextInputChange.current || isUpdating.current) {
      return;
    }

    // Skip if change came from preset
    if (lastChangeFromPreset.current) {
      lastChangeFromPreset.current = false;
      return;
    }

    // Skip if change came from reset
    if (lastChangeFromReset.current) {
      lastChangeFromReset.current = false;
      return;
    }

    // Skip if change came from file import
    if (lastChangeFromFile.current) {
      lastChangeFromFile.current = false;
      return;
    }

    // Skip if change from URL params
    if (lastChangeFromUrl.current) {
      lastChangeFromUrl.current = false;
      return;
    }

    // Skip if gateSlots is empty (initial state)
    // gateSlots define the visual circuit state
    if (!gateSlots || gateSlots.length === 0) {
      return;
    }

    // Convert visual changes back to text
    const newProcessedCircuit = convertArrayToString(gateSlots);

    // Only update if there's a meaningful change
    if (newProcessedCircuit !== circuit.displayCircuit) {
      isUpdating.current = true;
      dispatch(setCircuitFromVisual(newProcessedCircuit));

      // Reset flag after update
      setTimeout(() => {
        isUpdating.current = false;
      }, 50);
    }
  }, [gateSlots, circuit.displayCircuit, dispatch]);

  // Effect for reading in url params
  useEffect(() => {
    const input = searchParams.get("quicscript");

    if (input) {
      const { isValid, message } = validateQuantumGatePattern(
        input,
        circuit.allowedGates
      );

      if (isValid) {
        lastChangeFromUrl.current = true;
        circuit.setFromUrl(input);
      } else {
        setSearchParams({});
        setShowErrorDialog(true);
        setErrorMessage(
          <>
            {message.split("\n").map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </>
        );
      }
    }
  }, [searchParams, circuit.allowedGates, circuit.setFromUrl, setSearchParams]);

  // Handle errors in UI
  useEffect(() => {
    if (circuit.importError) {
      setShowErrorDialog(true);
      setErrorMessage(circuit.importError);
      dispatch(circuit.clearImportError());
    }
  }, [circuit.importError, dispatch]);

  // Event handlers with proper flags
  const handlePresetChange = (presetId) => {
    lastChangeFromPreset.current = true; // Set flag like original
    circuit.setFromPreset(presetId);
  };

  const handleTextInputChange = (newInput) => {
    // Set flag to prevent visual-to-text feedback (like original)
    isTextInputChange.current = true;
    circuit.setFromText(newInput);

    // Clear flag after delay (like original)
    setTimeout(() => {
      isTextInputChange.current = false;
    }, 300);
  };

  const handleFileImport = (content) => {
    lastChangeFromFile.current = true; // Set flag for file import
    dispatch(
      importCircuitFromFile({ content, allowedGates: circuit.allowedGates })
    );
  };

  const handleReset = () => {
    lastChangeFromReset.current = true; // Set flag for reset
    circuit.clear();

    // Also manually clear Gates object
    gates.clearCircuit();
  };

  // Other handler functions
  const handleSendToQibo = useCallback(async () => {
    // Validate circuit before sending to Qibo
    const { isValid, message } = validateQuantumGatePattern(
      circuit.displayCircuit,
      circuit.allowedGates
    );

    // If circuit not valid, show error message to user
    if (!isValid) {
      setShowErrorDialog(true);
      setErrorMessage(
        <>
          {message.split("\n").map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </>
      );
      return;
    }

    // Generate Qibo json from circuit if valid
    const qiboJson = convertStringToQibo(
      circuit.displayCircuit,
      gates,
      circuit.allowedGates
    );

    handleDownloadFile("circuit", qiboJson, ".json");

    // Right now, the goal is to simply check if the functionality works
    // as intended. This means that the json structure that is generated
    // across all circuit is correct and sensible. Once the code is
    // validated, the below code will be used for the next step.

    // // Get backend API URL
    // const apiUrl = (import.meta.env.VITE_API_URL || "/api") + "/circuits";

    // try {
    //   // POST Qibo circuit JSON to backend
    //   await axios.post(apiUrl, { circuit: qiboJson });

    //   // Show success alert to user
    //   setOpenSnackbar(true);
    // } catch (err) {
    //   // Extract and show error to user
    //   const { error, details } = err.response.data;

    //   setShowErrorDialog(true);
    //   setErrorMessage(error + (details ? `: ${details}` : ""));
    // }
  }, [circuit.displayCircuit]);

  const toggleFullscreen = () => {
    if (!fullsceen) document.body.requestFullscreen();
    else document.exitFullscreen();
    setFullscreen(!fullsceen);
  };

  return (
    <DragDropProvider>
      <TopDiv>
        {document.fullscreenEnabled && (
          <FullscreenButton onClick={toggleFullscreen}>
            Toggle Fullscreen
          </FullscreenButton>
        )}
        <VersionDiv>v{import.meta.env.__APP_VERSION__}</VersionDiv>
      </TopDiv>

      <SelectionDiv>
        <CircuitSelector>
          <label htmlFor="circuit-preset">Choose a circuit: </label>
          <select
            id="circuit-preset"
            value={circuit.selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
          >
            {config.presetCircuits.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </CircuitSelector>
        <SelectionRight>
          {config.display.showQiboTranslation && (
            <ButtonHolder onClick={handleSendToQibo}>Send to Qibo</ButtonHolder>
          )}
          {config.display.showImportExport && (
            <FileUploadDownload
              onFileRead={handleFileImport}
              gates={gates}
              config={config}
            />
          )}
        </SelectionRight>
      </SelectionDiv>

      <Builder
        key={`builder-${circuit.resultsResetKey}`}
        gates={gates}
        onRawInputChange={handleTextInputChange}
        onReset={handleReset}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
          Circuit submitted to Qibo successfully!
        </Alert>
      </Snackbar>

      <BasicDialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title={"⚠️ Error"}
        actions={
          <Button onClick={() => setShowErrorDialog(false)}>Close</Button>
        }
        onTransitionExited={() => setErrorMessage("")}
      >
        {errorMessage}
      </BasicDialog>
    </DragDropProvider>
  );
}
