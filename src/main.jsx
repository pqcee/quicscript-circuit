import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@atlaskit/css-reset";
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));

root.render(
  // <StrictMode>
  <App />
  // </StrictMode>
);
