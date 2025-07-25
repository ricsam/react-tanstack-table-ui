import { MenuItem, Select } from "@mui/material";
import { SelectionManager } from "@ricsam/selection-manager";

export const CountrySelect = ({
  value,
  selectionManager,
  cell,
}: {
  value: string;
  selectionManager: SelectionManager;
  cell: { row: number; col: number };
}) => {
  const countries = [
    { country: "Ireland", continent: "Europe", language: "English" },
    { country: "Spain", continent: "Europe", language: "Spanish" },
    { country: "United Kingdom", continent: "Europe", language: "English" },
    { country: "France", continent: "Europe", language: "French" },
    { country: "Germany", continent: "Europe", language: "German" },
    { country: "Sweden", continent: "Europe", language: "Swedish" },
    { country: "Italy", continent: "Europe", language: "Italian" },
    { country: "Greece", continent: "Europe", language: "Greek" },
    { country: "Brazil", continent: "South America", language: "Portuguese" },
    { country: "Argentina", continent: "South America", language: "Spanish" },
  ];
  return (
    <Select
      value={value}
      size="small"
      fullWidth
      onChange={(e) => {
        selectionManager.saveCellValue(
          { rowIndex: cell.row, colIndex: cell.col },
          e.target.value,
        );
        selectionManager.cancelEditing();
      }}
      autoFocus
      onBlur={() => {
        selectionManager.cancelEditing();
      }}
      sx={{
        width: "100%",
        height: "100%",
        color: "inherit",
        fontSize: "inherit",
        fontWeight: "inherit",
      }}
    >
      {countries.map((country) => (
        <MenuItem key={country.country} value={country.country}>
          {country.country}
        </MenuItem>
      ))}
    </Select>
  );
};
