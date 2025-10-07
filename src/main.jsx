import { createRoot } from "react-dom/client";
import "@atlaskit/css-reset";
import { ConfigProvider } from "./hooks/useConfig.jsx";
import ConfigLoader from "./ConfigLoader.jsx";

const root = createRoot(document.getElementById("root"));

root.render(
  <ConfigProvider>
    <ConfigLoader />
  </ConfigProvider>
);
