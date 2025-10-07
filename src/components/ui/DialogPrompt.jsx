import {
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Box,
  TextField,
} from "@mui/material";
import { useState } from "react";
import BasicDialog from "./BasicDialog";

const DialogPrompt = ({
  open,
  onClose,
  onSubmit,
  title = "Choose an option",
  options = [],
  value,
  onChange,
}) => {
  const [filename, setFilename] = useState("");

  const handleSubmit = () => {
    const selectedOption = options.find((opt) => opt.value === value);
    const fullFilename = filename + (selectedOption?.extension || "");
    onSubmit(value, fullFilename, selectedOption?.extension);
    onClose();
    setFilename(""); // Reset filename
  };

  const handleClose = () => {
    onClose();
    setFilename(""); // Reset filename on cancel
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const showFilenameInput = value && selectedOption?.extension;

  return (
    <BasicDialog
      open={open}
      onClose={handleClose}
      title={title}
      actions={
        <>
          <Button
            onClick={handleSubmit}
            disabled={!value || (showFilenameInput && !filename.trim())}
          >
            OK
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </>
      }
    >
      <RadioGroup value={value} onChange={onChange}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
            disabled={option.disabled}
          />
        ))}
      </RadioGroup>

      {showFilenameInput && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Enter filename"
            slotProps={{
              input: {
                endAdornment: selectedOption.extension,
              },
            }}
            helperText={`File will be saved as: ${filename}${selectedOption.extension}`}
          />
        </Box>
      )}
    </BasicDialog>
  );
};

export default DialogPrompt;
