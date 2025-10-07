import { createSelector } from "@reduxjs/toolkit";
import { delimiter } from "../logic/Helper";

// Basic selectors
export const selectRawCircuit = (state) => state.circuit.rawCircuit;
export const selectGateSlots = (state) => state.circuit.gateSlots;
export const selectParameters = (state) => state.circuit.parameters;
export const selectSelectedPreset = (state) => state.circuit.selectedPreset;
export const selectSource = (state) => state.circuit.source;
export const selectResultsResetKey = (state) => state.circuit.resultsResetKey;
export const selectImporting = (state) => state.circuit.importing;
export const selectImportError = (state) => state.circuit.importError;

// This selector needs multiShot passed to it from components
export const makeSelectDisplayCircuit = () =>
  createSelector(
    [selectRawCircuit, (_, multiShot) => multiShot],
    (rawCircuit, multiShot) => {
      if (!rawCircuit) return "";
      return multiShot
        ? rawCircuit.replaceAll("m", "M")
        : rawCircuit.replaceAll("M", "m");
    }
  );

// Selector factory that needs config passed to it
export const makeSelectAllowedGates = () =>
  createSelector(
    [(_, config, multiShot) => config, (_, config, multiShot) => multiShot],
    (config, multiShot) => {
      if (!config) return [];
      const gates = {
        ...config.availableGates,
        measurement: multiShot ? ["M"] : ["m"],
      };
      return Object.values(gates).flat();
    }
  );

// Selector factory for processed presets
export const makeSelectProcessedPresets = () =>
  createSelector(
    [(_, config, multiShot) => config, (_, config, multiShot) => multiShot],
    (config, multiShot) => {
      if (!config) return [];
      return config.presetCircuits.map((preset) => ({
        ...preset,
        circuit: multiShot
          ? preset.circuit.replaceAll("m", "M")
          : preset.circuit.replaceAll("M", "m"),
      }));
    }
  );

// Selector factory for finding matching preset
export const makeSelectMatchingPreset = () =>
  createSelector(
    [
      selectRawCircuit,
      (_, config, multiShot) => config,
      (_, config, multiShot) => multiShot,
    ],
    (rawCircuit, config, multiShot) => {
      if (!config || !rawCircuit) return null;

      // Transform the current circuit the same way displayCircuit does
      const currentDisplayCircuit = multiShot
        ? rawCircuit.replaceAll("m", "M")
        : rawCircuit.replaceAll("M", "m");

      const processedPresets = config.presetCircuits.map((preset) => ({
        ...preset,
        circuit: multiShot
          ? preset.circuit.replaceAll("m", "M")
          : preset.circuit.replaceAll("M", "m"),
      }));

      return processedPresets.find((preset) => {
        let presetCircuit = preset.circuit;
        let inputCircuit = currentDisplayCircuit;

        // Handle delimiters at the end of strings
        if (delimiter.includes(presetCircuit.slice(-1))) {
          presetCircuit = presetCircuit.slice(0, -1);
        }
        if (delimiter.includes(inputCircuit.slice(-1))) {
          inputCircuit = inputCircuit.slice(0, -1);
        }

        return presetCircuit === inputCircuit;
      });
    }
  );

// Derived selectors for visual state
export const selectCircuitDimensions = createSelector(
  [selectGateSlots],
  (gateSlots) => {
    if (!gateSlots || gateSlots.length === 0) {
      return { columns: 0, qubits: 0 };
    }
    return {
      columns: gateSlots[0].length,
      qubits: gateSlots.length,
    };
  }
);
