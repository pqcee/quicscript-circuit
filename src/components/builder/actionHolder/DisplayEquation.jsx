// Module imports
import { useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";

// Logic class imports
import { StateResult } from "../../../logic/QuICScriptManager";

// Component imports
import { ButtonHolder } from "../../ui/ButtonHolder";

/**
 * Generates a MathML DOM element
 * @param {string} mimo
 * @returns MathML DOM element
 */
function getMathDom(mimo) {
  const newPrefix = document.createElement("span");
  newPrefix.className = "katex-mathml";
  newPrefix.innerHTML = `
    <math xmlns="http://www.w3.org/1998/Math/MathML">
      <semantics>
        <mrow>
          ${mimo}
        </mrow>
      </semantics>
    </math>`;
  return newPrefix;
}

const mathiwithNumber = (number) =>
  getMathDom((number == 0 ? `` : `<mn>${number}</mn>`) + "<mi>i</mi>");

/**
 *
 * Note: This component uses dangerouslySetInnerHTML to render the equation.
 * @param {StateResult[]} quicEquationResult
 */
export const DisplayEquation = ({ quicEquationResult }) => {
  const ref = useRef();

  const [tex, setTex] = useState("");
  const [displayClipboard, setDisplayClipboard] = useState(false);

  useEffect(() => {
    const checkClipboardPermission = async () => {
      try {
        // Try to check permission
        const permission = await navigator.permissions.query({
          name: "clipboard-write",
        });
        setDisplayClipboard(permission.state !== "denied");
      } catch (err) {
        // Permission query not supported, assume clipboard is available
        // Most modern browsers support clipboard API even without permission query
        setDisplayClipboard(true);
      }
    };

    checkClipboardPermission();
  }, []);

  const html = useMemo(() => {
    // let tex = "| \\varphi \\rangle = ";
    let tex = "";
    if (quicEquationResult == null) return <div></div>;
    quicEquationResult.forEach((stateResult, i) => {
      const { state, real, imaginary } = stateResult;
      const stateString = `| ${state} \\rangle`;

      let stateResultString = "";

      if (real < 0 && imaginary < 0) {
        stateResultString = `-(${-real} + ${-imaginary} i )`;
        stateResultString += stateString;
        tex += stateResultString;
        return;
      } else if (real == 0) {
        if (imaginary == 1) stateResultString = "+ i";
        else if (imaginary == -1) stateResultString = "- i";
        else stateResultString = `+ ${imaginary}i`;
      } else if (imaginary == 0) {
        stateResultString = `+ ${real}`;
      } else {
        // Update to display brackets
        if (imaginary < 0) stateResultString = `+ (${real} - ${-imaginary}i)`;
        else stateResultString = `+ (${real} + ${imaginary}i)`;
      }

      if (i == 0 && stateResultString.slice(0, 2) == "+ ") {
        stateResultString = stateResultString.substring(2);
      }

      stateResultString += stateString;
      tex += stateResultString + " ";
    });

    setTex(tex);

    return katex.renderToString(tex, {
      throwOnError: false,
      output: "html",
    });
  }, [quicEquationResult]);

  // Called after html been rendered
  useEffect(() => {
    const element = ref.current.firstChild.firstChild;
    if (element.firstChild.className == "katex-mathml") return; // Prefix Exists

    const mathPrefix = getMathDom(
      `<mi mathvariant="normal">∣</mi><mi>ψ</mi><mo stretchy="false">⟩</mo><mo>=</mo>`
    );

    element.insertBefore(mathPrefix, element.firstChild);

    const iElements = [...element.getElementsByClassName("mord mathnormal")];

    for (let e of iElements) {
      const parent = e.parentElement;
      const value = e.previousSibling;
      // check if value textcontent is number
      if (!isNaN(value.textContent)) {
        // Is a number
        const floatValue = +value.textContent;
        parent.replaceChild(mathiwithNumber(floatValue), e);
        // Remove number
        parent.removeChild(value);
      } else parent.replaceChild(getMathDom("<mi>i</mi>"), e);
    }
  }, [html]);

  const handleCopy = ({ target }) => {
    navigator.clipboard.writeText("| \\varphi \\rangle = " + tex).then(() => {
      target.innerText = "Copied!";
      setTimeout(() => (target.innerText = "Copy LaTeX"), 1000);
    });
  };

  return (
    <div style={{ width: "fit-content", margin: "auto" }}>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
      {displayClipboard && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ButtonHolder onClick={handleCopy}>Copy LaTeX</ButtonHolder>
        </div>
      )}
    </div>
  );
};
