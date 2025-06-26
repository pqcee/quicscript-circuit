import styled from "@emotion/styled";

const Wrapper = styled.div`
  margin-left: 30px;
  border-radius: 10px;
  cursor: pointer;
  border: 0px;
  background-color: rgb(99, 230, 190);
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.9;
`;

const Text = styled.div`
  height: 10px;
  line-height: 7px;
`;

export function AddRowButton({ addRow }) {
  return (
    <Wrapper>
      <Text onClick={addRow}>+</Text>
    </Wrapper>
  );
}
