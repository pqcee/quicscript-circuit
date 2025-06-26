import styled from "@emotion/styled";

export const ButtonHolder = styled.button`
  padding: 5px 15px;
  background: linear-gradient(#275fbd, #08aee0);
  color: white;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  align-self: center;
  align-content: center;
  position: relative;
  &:disabled:hover {
    cursor: not-allowed;
  }
  &:disabled::after {
    content: "";
    background: grey;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.6;
    border-radius: 4px;
  }
`;
