import styled from "@emotion/styled";

const Wrapper = styled.div`
  height: 40px;
  position: relative;
  &:hover {
    > div:first-of-type {
      display: block;
    }
  }
`;

const ToolTipText = styled.div`
  display: none;
  position: absolute;

  top: -30px;
  background: white;
  white-space: nowrap;
  border: 1px solid lightgrey;
  padding: 2px 5px;
  border-radius: 5px;
  z-index: 1000;

  &:after {
    content: "";
    position: absolute;
    top: 100%;
    left: 20px;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: lightgrey transparent transparent transparent;
  }
`;

/**
 * A styled component that represents a tooltip wrapper.
 * The tooltip is hidden by default and positioned absolutely.
 * It has a white background, light grey border, and a small arrow pointing upwards.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {string} props.text - The text to be displayed inside the tooltip.
 * @param {React.ReactNode} props.children - The children elements to be wrapped by the tooltip.
 * @returns {JSX.Element} The rendered tooltip wrapper component.
 */
export function ToolTip({ text, children }) {
  return (
    <Wrapper>
      <ToolTipText>{text}</ToolTipText>
      {children}
    </Wrapper>
  );
}
