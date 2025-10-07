import { createAsyncThunk } from "@reduxjs/toolkit";
import { convertFileToString } from "../../logic/Converter";
import { validateQuantumGatePattern } from "../../logic/Helper";

export const importCircuitFromFile = createAsyncThunk(
  "circuit/importFromFile",
  async ({ content, allowedGates }, { rejectWithValue }) => {
    try {
      const circuitString = convertFileToString(content);
      const { isValid, message } = validateQuantumGatePattern(
        circuitString,
        allowedGates
      );

      if (!isValid) {
        return rejectWithValue(message);
      }

      return circuitString;
    } catch (error) {
      return rejectWithValue("Failed to process file");
    }
  }
);
