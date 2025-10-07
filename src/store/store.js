import { configureStore } from "@reduxjs/toolkit";
import circuitReducer from "./circuitSlice";

export const store = configureStore({
  reducer: {
    circuit: circuitReducer,
  },
});
