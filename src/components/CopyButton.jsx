import { useState } from "react";
import styled from "@emotion/styled";
import { IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

const SquareIconButton = styled(IconButton)`
  border-radius: 10px;
  width: 28px;
  height: 28px;
  padding: 5px 15px;
  color: white;
  background: linear-gradient(#275fbd, #08aee0);
  border-radius: 4px;
  > svg {
    font-size: 18px;
  }
`;

/**
 * CopyButton component allows users to copy a given text to the clipboard.
 * It displays a copy icon initially and changes to a check icon when the text is copied.
 *
 * @param {Object} props - The props object.
 * @param {string} props.copyText - The text to be copied to the clipboard.
 * @returns {JSX.Element} The rendered CopyButton component.
 */
export function CopyButton({ copyText, style }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  };

  return (
    <SquareIconButton aria-label="copy" onClick={handleCopy} style={style}>
      {copied ? <CheckIcon /> : <ContentCopyIcon />}
    </SquareIconButton>
  );
}
