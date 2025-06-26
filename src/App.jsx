import { useMemo, useState } from "react";
import { Builder } from "./components/Builder.jsx";
import { Gates } from "./logic/Gates.js";
import styled from "@emotion/styled";
import { QuICScript } from "./logic/QuICScript.js";
import { Config } from "./logic/Config.js";

// Example Grover: HHH,IIX,IIH,CCN,XXI,IIH,IIX,IIH,CCN,XII,HII,XXI,IHI,IXX,IIH,CCN,XII,HXI,IHH,IIX,IIH

const FullscreenButton = styled.div`
  cursor: pointer;
  position: sticky;
  width: fit-content;
  padding: 0 10px;
  background-color: darkgrey;
  border-radius: 5px;
  color: white;
  font-size: 0.9em;
`;

const TopDiv = styled.div`
  display: flex;
  justify-content: space-between;
`;

const VersionDiv = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding-right: 5px;
  font-size: x-small;
  white-space: break-spaces;
  text-align: right;
`;

export default function App() {
  const [fullsceen, setFullscreen] = useState(false);
  const gates = useMemo(() => {
    const { defaultQubits, defaultColumns, defaultQuic } = Config.getConfig();
    const gates = new Gates(defaultQubits, defaultColumns, defaultQuic);
    QuICScript.setGates(gates);
    return gates;
  }, []);

  function toggleFullscreen() {
    if (!fullsceen) document.body.requestFullscreen();
    else document.exitFullscreen();
    setFullscreen(!fullsceen);
  }

  return (
    <>
      <TopDiv>
        {document.fullscreenEnabled && (
          <FullscreenButton onClick={toggleFullscreen}>
            Toggle Fullscreen
          </FullscreenButton>
        )}
        <VersionDiv>v{import.meta.env.__APP_VERSION__}</VersionDiv>
      </TopDiv>

      <Builder gates={gates} />
    </>
  );
}
