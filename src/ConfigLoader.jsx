import App from "./App";
import { GateSettingsProvider } from "./contexts/GateSettingsContext";
import { useConfig } from "./hooks/useConfig";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "./store/store";

const ConfigLoader = () => {
  const { config, loading } = useConfig();

  // Check if config is loaded
  if (loading) return <div>Loading...</div>;
  if (!config) return <div>Failed to load config</div>;

  return (
    <BrowserRouter>
      <Provider store={store}>
        <GateSettingsProvider>
          <App config={config} />
        </GateSettingsProvider>
      </Provider>
    </BrowserRouter>
  );
};

export default ConfigLoader;
