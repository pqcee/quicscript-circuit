import { useSelector, useDispatch } from "react-redux";
import { useGateSettings } from "../contexts/GateSettingsContext";
import { useMemo, useEffect } from "react";
import {
  selectRawCircuit,
  selectSelectedPreset,
  selectSource,
  selectResultsResetKey,
  makeSelectDisplayCircuit,
  makeSelectAllowedGates,
  makeSelectProcessedPresets,
  makeSelectMatchingPreset,
  selectImportError,
} from "../store/selectors";
import {
  setCircuitFromText,
  setCircuitFromPreset,
  setCircuitFromVisual,
  setCircuitFromFile,
  setCircuitFromUrl,
  clearCircuit,
  updatePresetMatch,
  clearImportError,
} from "../store/circuitSlice";
import { useSearchParams } from "react-router";

export const useCircuitState = (config) => {
  const dispatch = useDispatch();
  const { multiShot } = useGateSettings();
  const [_, setSearchParams] = useSearchParams();

  // Basic state
  const rawCircuit = useSelector(selectRawCircuit);
  const selectedPreset = useSelector(selectSelectedPreset);
  const source = useSelector(selectSource);
  const resultsResetKey = useSelector(selectResultsResetKey);

  // Error state
  const importError = useSelector(selectImportError);

  // Memoized selectors that depend on external values
  const selectDisplayCircuit = useMemo(makeSelectDisplayCircuit, []);
  const selectAllowedGates = useMemo(makeSelectAllowedGates, []);
  const selectProcessedPresets = useMemo(makeSelectProcessedPresets, []);
  const selectMatchingPreset = useMemo(makeSelectMatchingPreset, []);

  // Derived state
  const displayCircuit = useSelector((state) =>
    selectDisplayCircuit(state, multiShot)
  );
  const allowedGates = useSelector((state) =>
    selectAllowedGates(state, config, multiShot)
  );
  const processedPresets = useSelector((state) =>
    selectProcessedPresets(state, config, multiShot)
  );
  const matchingPreset = useSelector((state) =>
    selectMatchingPreset(state, config, multiShot)
  );

  // Update preset match when it changes (for non-preset sources)
  useEffect(() => {
    if (source !== "preset" && matchingPreset?.id !== selectedPreset) {
      dispatch(updatePresetMatch(matchingPreset?.id));
    }
  }, [matchingPreset, selectedPreset, source, dispatch]);

  // Action creators
  const actions = useMemo(
    () => ({
      setFromText: (circuit) => dispatch(setCircuitFromText(circuit)),
      setFromPreset: (presetId) => {
        const preset = processedPresets.find((p) => p.id === presetId);
        if (preset) {
          dispatch(setCircuitFromPreset({ circuit: preset.circuit, presetId }));
        }
      },
      setFromVisual: (circuit) => dispatch(setCircuitFromVisual(circuit)),
      setFromFile: (circuit) => dispatch(setCircuitFromFile(circuit)),
      setFromUrl: (circuit) => dispatch(setCircuitFromUrl(circuit)),
      clear: () => {
        setSearchParams({});
        dispatch(clearCircuit());
      },
      clearImportError: () => dispatch(clearImportError()),
    }),
    [dispatch, processedPresets]
  );

  return {
    // State
    rawCircuit,
    displayCircuit,
    selectedPreset,
    source,
    resultsResetKey,
    importError,

    // Derived state,
    allowedGates,
    processedPresets,
    matchingPreset,

    // Actions
    ...actions,
  };
};
