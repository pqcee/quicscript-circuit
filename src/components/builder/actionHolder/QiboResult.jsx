// Module imports
import styled from "@emotion/styled";
import { Button } from "@mui/material";

// Component imports
import { CopyButton } from "../../ui/CopyButton";

const Wrapper = styled.div`
  width: fit-content;
`;

const ActionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const IpynbButton = styled(Button)`
  font-size: font-size 13.3333px;
  white-space: nowrap;
  text-transform: none;
  font-weight: normal;
  font-family: inherit;
  height: 28px;
  background: linear-gradient(#275fbd, #08aee0);
  gap: 5px;
  > svg {
    font-size: 10px;
    color: white;
  }
`;

const TextDiv = styled.span`
  display: block;
`;

/**
 * Creates an IPython Notebook (ipynb) template with the provided Qibo string.
 *
 * @param {string} qiboString - The string content to include in the ipynb template.
 * @returns {string} The ipynb template as a JSON string.
 */
const createIpynbTemplate = (qiboString) => {
  const ipynbTemplate = {
    cells: [
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [qiboString],
      },
    ],
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3",
      },
      language_info: {
        codemirror_mode: {
          name: "ipython",
          version: 3,
        },
        file_extension: ".py",
        mimetype: "text/x-python",
        name: "python",
        nbconvert_exporter: "python",
        pygments_lexer: "ipython3",
        version: "3.8.5",
      },
    },
    nbformat: 4,
    nbformat_minor: 4,
  };
  return JSON.stringify(ipynbTemplate, null, 2);
};

/**
 * QiboResult component displays a string result with options to copy the content
 * to the clipboard and download it as an ipynb file.
 *
 * @param {Object} props - The component props.
 * @param {string} props.qiboString - The string content to display and copy.
 * @returns {JSX.Element} The rendered QiboResult component.
 */
export function QiboResult({ qiboString }) {
  const handleIpynbDownload = () => {
    const blob = new Blob([createIpynbTemplate(qiboString)], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qibo.ipynb";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Wrapper>
      <ActionWrapper>
        <IpynbButton variant="contained" onClick={handleIpynbDownload}>
          <span>Download ipynb</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            fill="#fff"
            width="18px"
            height="18px"
          >
            <path d="M439.8 200.5c-7.7-30.9-22.3-54.2-53.4-54.2h-40.1v47.4c0 36.8-31.2 67.8-66.8 67.8H172.7c-29.2 0-53.4 25-53.4 54.3v101.8c0 29 25.2 46 53.4 54.3 33.8 9.9 66.3 11.7 106.8 0 26.9-7.8 53.4-23.5 53.4-54.3v-40.7H226.2v-13.6h160.2c31.1 0 42.6-21.7 53.4-54.2 11.2-33.5 10.7-65.7 0-108.6zM286.2 404c11.1 0 20.1 9.1 20.1 20.3 0 11.3-9 20.4-20.1 20.4-11 0-20.1-9.2-20.1-20.4 .1-11.3 9.1-20.3 20.1-20.3zM167.8 248.1h106.8c29.7 0 53.4-24.5 53.4-54.3V91.9c0-29-24.4-50.7-53.4-55.6-35.8-5.9-74.7-5.6-106.8 .1-45.2 8-53.4 24.7-53.4 55.6v40.7h106.9v13.6h-147c-31.1 0-58.3 18.7-66.8 54.2-9.8 40.7-10.2 66.1 0 108.6 7.6 31.6 25.7 54.2 56.8 54.2H101v-48.8c0-35.3 30.5-66.4 66.8-66.4zm-6.7-142.6c-11.1 0-20.1-9.1-20.1-20.3 .1-11.3 9-20.4 20.1-20.4 11 0 20.1 9.2 20.1 20.4s-9 20.3-20.1 20.3z" />
          </svg>
        </IpynbButton>
        <CopyButton copyText={qiboString} />
      </ActionWrapper>
      <div>
        {qiboString.length > 0
          ? qiboString
              .split("\n")
              .map((str, i) => <TextDiv key={i}>{str}</TextDiv>)
          : ""}
      </div>
    </Wrapper>
  );
}
