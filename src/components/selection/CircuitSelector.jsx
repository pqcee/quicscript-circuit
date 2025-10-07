import { FormControl, Select, InputLabel, MenuItem } from "@mui/material";

const CircuitSelector = ({ selectedCircuit, handleSelectedCircuitChange }) => {
  return (
    <FormControl>
      <InputLabel id="select-circuit-label">Choose a circuit</InputLabel>
      <Select
        labelId="select-circuit-label"
        id="select-circuit"
        value={selectedCircuit}
        label="Choose a circuit"
        onChange={handleSelectedCircuitChange}
      >
        <MenuItem value="">Custom</MenuItem>
        <MenuItem value="HI,CN.">Bell State</MenuItem>
        <MenuItem value="HII,CNI,ICN.">GHZ 3 Qubit</MenuItem>
        <MenuItem value="HHHI,IIIX,IIIH,IIII,CCCN,IIII,IIIH,IIIX,HHHI,XXXI,IIHI,CCNI,IIHI,XXXI,HHHI,IIIX,IIIH,IIII,CCCN,IIII,IIIH,IIIX,HHHI,XXXI,IIHI,CCNI,IIHI,XXXI,HHHI.">
          Simon s=11
        </MenuItem>
        <MenuItem value="HHI,IIX,IIH,III,CCN,III,IIH,IIX,HHI,XXI,IHI,CNI,IHI,XXI,HHI.">
          Grover 2 Qubit
        </MenuItem>
        <MenuItem value="HHHI,IIIX,IIIH,IIII,CCCN,IIII,IIIH,IIIX,HHHI,XXXI,IIHI,CCNI,IIHI,XXXI,HHHI,IIIX,IIIH,IIII,CCCN,IIII,IIIH,IIIX,HHHI,XXXI,IIHI,CCNI,IIHI,XXXI,HHHI.">
          Grover 3 Qubit
        </MenuItem>
        <MenuItem value="HHHII,IICIN,ICIIN,IIINC,ICICN,IIINC,IIIIX,CIINC,IIIIX,IIINC,CIICN,IIINC,IIHII,ICPII,CITII,IHIII,CPIII,HIIII.">
          Shor (factor 21)
        </MenuItem>
        <MenuItem value="HHHIIII,CIIIIIN,ICIININ,IIIIICN,IICIICN,IIIIICN,IIICNII,IICCNII,IIIIICN,IIImmmm,HIIIIII,CPIIIII,IHIIIII,CITIIII,ICPIIII,IIHIIII,IIIdddd">
          Shor (factor 15)
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default CircuitSelector;
