// Module imports
import { useRef, useState } from "react";
import { Box, Button, ButtonGroup } from "@mui/material";
import styled from "@emotion/styled";

// Redux and Logic class imports
import { Gates } from "../../logic/Gates";
import { useCircuitState } from "../../hooks/useCircuitState";

// Helper imports
import {
  convertStringToFile,
  convertStringToQibo,
} from "../../logic/Converter";

// Component imports
import { ButtonHolder } from "../ui/ButtonHolder";
import DialogPrompt from "../ui/DialogPrompt";
import BasicDialog from "../ui/BasicDialog";

const TransferButtonHolder = styled(ButtonHolder)`
  &:first-of-type {
    border-radius: 4px 0 0 4px;
    border: 1px solid white;
  }

  &:last-of-type {
    border-radius: 0 4px 4px 0;
  }

  &:only-child {
    border-radius: 4px;
  }

  &:not(:first-of-type):not(:last-of-type) {
    border-radius: 0;
  }
`;

// Handle downloading QuICScript file
export const handleDownloadFile = (filename, fileContent, extension) => {
  // Create a BLOB object from the content
  let blob;
  if (extension === ".txt") {
    blob = new Blob([fileContent], { type: "text/plain" });
  } else if (extension === ".json") {
    blob = new Blob([fileContent], { type: "application/json" });
  }

  // Create temporary url for BLOB
  const url = URL.createObjectURL(blob);

  // Attach a link to DOM
  const link = document.createElement("a");

  // Attach temporary url to link, and set filename
  link.href = url;
  link.download = filename;

  // Click the link to download the file
  link.click();

  // Remove the temporary url
  URL.revokeObjectURL(url);
};

/**
 * For uploading QuICScript files by user
 * @param {Function} onFileRead - Reads the contents of uploaded file
 * @param {Gates} gates - gates service class object
 * @param {Object} config - Global config object
 *
 * @returns FileUploadDownload component
 */
const FileUploadDownload = ({ onFileRead, gates, config }) => {
  const fileInputRef = useRef(null);

  // Circuit state from Redux store
  const circuit = useCircuitState(config);

  // State for DialogPrompt (opening and tracking value)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [radioValue, setRadioValue] = useState("quic");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const radioOptions = [
    { value: "quic", label: "QuICScript", extension: ".txt" },
    {
      value: "qibo",
      label: "JSON (experimental)",
      extension: ".json",
      disabled: false,
    },
  ];

  // Handle file dialog submit
  const handleDialogSubmit = (selectedValue, selectedFilename, extension) => {
    setRadioValue("quic"); // Reset for next time

    let formattedFileContent;
    if (selectedValue === "quic") {
      // Format content into a file format
      formattedFileContent = convertStringToFile(circuit.displayCircuit, gates);
      handleDownloadFile(selectedFilename, formattedFileContent, extension);
    } else if (selectedValue === "qibo") {
      formattedFileContent = convertStringToQibo(
        circuit.displayCircuit,
        gates,
        circuit.allowedGates
      );
      handleDownloadFile(selectedFilename, formattedFileContent, extension);
    }
  };

  // Handle error dialog close
  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
  };

  // Handle upload button click
  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle imported file changes
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        onFileRead(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    // Check if content is not empty
    const content = circuit.displayCircuit;
    if (!content || content.length === 0) {
      setShowErrorDialog(true);
      setErrorMessage(
        "Circuit is empty. Please create a circuit before you download."
      );
      return;
    }

    setDialogOpen(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <input
        accept="*"
        style={{ display: "none" }}
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
      />
      <ButtonGroup
        variant="contained"
        aria-label="file upload/download button group"
      >
        <TransferButtonHolder type="button" onClick={handleUpload}>
          Upload Circuit
        </TransferButtonHolder>
        <TransferButtonHolder onClick={handleDownload}>
          Download Circuit
        </TransferButtonHolder>
      </ButtonGroup>

      <BasicDialog
        open={showErrorDialog}
        onClose={handleErrorDialogClose}
        title={"⚠️ Error"}
        actions={<Button onClick={handleErrorDialogClose}>Close</Button>}
        onTransitionExited={() => setErrorMessage("")}
      >
        {errorMessage}
      </BasicDialog>

      <DialogPrompt
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        title="Choose export format"
        options={radioOptions}
        value={radioValue}
        onChange={(e) => setRadioValue(e.target.value)}
      />
    </Box>
  );
};

export default FileUploadDownload;
