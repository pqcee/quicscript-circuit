import styled from "@emotion/styled";
import { Slider } from "@mui/material";
import { useState } from "react";

const Wrapper = styled.div`
  margin-left: 40px;
  width: ${(props) => props.columns * 50}px;
`;

const CustomSlider = styled(Slider)(() => ({
  "& .MuiSlider-valueLabel": {
    whiteSpace: "pre",
    textAlign: "left",
    fontVariantNumeric: "tabular-nums",
  },
}));

/**
 * SliderHolder component renders a slider that allows users to select a value
 * based on the number of columns and displays corresponding results from
 * runQuicResults array.
 *
 * @param {Object} props - The properties object.
 * @param {number} props.columns - The number of columns to determine the slider's maximum value.
 * @param {string[]} props.runQuicResults - An array of results to display based on the slider's value.
 * @returns {JSX.Element} The rendered SliderHolder component.
 */
export function SliderHolder({ columns, runQuicResults }) {
  const [sliderValue, setSliderValue] = useState(0);

  const valueLabelFormat = (value) => {
    if (value > runQuicResults.length) return `Depth ${value}\nEmpty`;
    if (value == 0) return `All |0>`;
    return runQuicResults[value - 1];
  };

  return (
    <Wrapper columns={columns}>
      <CustomSlider
        aria-label="State"
        defaultValue={0}
        getAriaValueText={(value) => `${value}°C`}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={0}
        max={columns}
        disabled={runQuicResults.length == 0}
        value={sliderValue}
        valueLabelFormat={valueLabelFormat}
        onChange={(_, v) => setSliderValue(v)}
      />
    </Wrapper>
  );
}
