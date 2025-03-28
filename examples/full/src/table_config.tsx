export interface TableConfig {
  rowCount: number;
  columnCount: number;
  features: {
    expandable: boolean;
    selectable: boolean;
    columnGroups: boolean;
    draggable: boolean;
  };
  dataSize: "small" | "big";
  skin: "default" | "mui";
}

export const defaultTableConfig: TableConfig = {
  rowCount: 5,
  columnCount: 4,
  features: {
    expandable: false,
    selectable: false,
    columnGroups: false,
    draggable: true,
  },
  dataSize: "small",
  skin: "default",
};

export function getFeatureDescription(feature: keyof TableConfig["features"]): string {
  switch (feature) {
    case "expandable":
      return "Show/hide nested rows";
    case "selectable":
      return "Allow row selection with checkboxes";
    case "columnGroups":
      return "Group related columns together";
    case "draggable":
      return "Enable row reordering";
    default:
      return "";
  }
}

export function getConfigSummary(config: TableConfig): string {
  const features = Object.entries(config.features)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key)
    .join(", ");

  const skinInfo = `${config.skin === "default" ? "Default" : "Material UI"} skin`;
  const dataInfo = config.dataSize === "big" ? "Large dataset" : `${config.rowCount} rows, ${config.columnCount} columns`;
  
  return `${dataInfo} with ${skinInfo}${features ? ` and ${features}` : ""}`;
}
