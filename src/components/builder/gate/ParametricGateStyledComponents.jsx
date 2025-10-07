import styled from "@emotion/styled";

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  justify-content: center;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  position: relative;
  border: 1px solid transparent;
  &:hover {
    > div {
      display: grid;
    }
  }
`;

export const Dropdown = styled.div`
  z-index: 9;
  display: none;

  position: absolute;
  width: max-content;
  min-width: 100px;
  top: 39px;

  border-radius: 5px 0 0 5px;
  overflow: hidden;
`;

export const AngleInputWrapper = styled.div`
  display: flex;
`;

export const SymbolInput = styled.input`
  display: inline-block;
  width: 80px;
  box-sizing: border-box;
`;

export const AngleDiv = styled.div`
  display: inline-block;
  background-color: aqua;
  width: 25px;
  align-items: center;
  text-align: center;
  &.line-height {
    line-height: 17px;
  }
`;
