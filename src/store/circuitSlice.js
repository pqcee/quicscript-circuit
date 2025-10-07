import { createSlice } from "@reduxjs/toolkit";
import { importCircuitFromFile } from "./thunks/circuitThunks";

const circuitSlice = createSlice({
  name: "circuit",
  initialState: {
    rawCircuit: "",
    gateSlots: [], // Visual representation of the circuit
    parameters: { uHolder: {}, rHolder: {} }, // U and R gate parameters
    selectedPreset: "custom",
    source: "initial", // 'text', 'preset', 'visual', 'file', 'url', 'reset'
    resultsResetKey: 0,
    importing: false,
    importError: null,
  },
  reducers: {
    setCircuitFromText: (state, action) => {
      state.rawCircuit = action.payload;
      state.source = "text";
      // Preset matching happens in selectors
    },
    setCircuitFromPreset: (state, action) => {
      state.rawCircuit = action.payload.circuit;
      state.selectedPreset = action.payload.presetId;
      state.source = "preset";
      state.resultsResetKey += 1;
    },
    setCircuitFromVisual: (state, action) => {
      state.rawCircuit = action.payload;
      state.source = "visual";
      // Preset matching happens in selectors
    },
    setCircuitFromFile: (state, action) => {
      state.rawCircuit = action.payload;
      state.source = "file";
      // Preset matching happens in selectors
    },
    setCircuitFromUrl: (state, action) => {
      state.rawCircuit = action.payload;
      state.source = "url";
      // Preset matching happens in selectors
    },
    clearCircuit: (state) => {
      state.rawCircuit = "";
      state.selectedPreset = "custom";
      state.source = "reset";
      state.resultsResetKey += 1;
    },
    // Update visual state from Gates object
    updateGateSlots: (state, action) => {
      const { gateSlots, parameters, rawCircuit, updateText, source } =
        action.payload;

      state.gateSlots = gateSlots;
      state.parameters = parameters;

      // Only update rawCircuit if this came from visual representation
      if (updateText && rawCircuit !== undefined) {
        state.rawCircuit = rawCircuit;
        state.source = source || "visual";
      }
    },
    // This will be called by selectors when preset matching changes
    updatePresetMatch: (state, action) => {
      state.selectedPreset = action.payload || "custom";
      if (!action.payload && state.selectedPreset !== "custom") {
        state.resultsResetKey += 1;
      }
    },
    clearImportError: (state) => {
      state.importError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(importCircuitFromFile.pending, (state) => {
        state.importing = true;
        state.importError = null;
      })
      .addCase(importCircuitFromFile.fulfilled, (state, action) => {
        state.rawCircuit = action.payload;
        state.source = "file";
        state.importing = false;
      })
      .addCase(importCircuitFromFile.rejected, (state, action) => {
        state.importing = false;
        state.importError = action.payload;
      });
  },
});

export const {
  setCircuitFromText,
  setCircuitFromPreset,
  setCircuitFromVisual,
  setCircuitFromFile,
  setCircuitFromUrl,
  clearCircuit,
  updateGateSlots,
  updatePresetMatch,
  clearImportError,
} = circuitSlice.actions;

export default circuitSlice.reducer;
