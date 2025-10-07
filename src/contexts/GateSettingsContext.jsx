import { createContext, useContext, useState } from "react";

const GateSettingsContext = createContext();

export const GateSettingsProvider = ({ children }) => {
  const [multiShot, setMultiShot] = useState(false);

  return (
    <GateSettingsContext.Provider value={{ multiShot, setMultiShot }}>
      {children}
    </GateSettingsContext.Provider>
  );
};

export const useGateSettings = () => useContext(GateSettingsContext);
