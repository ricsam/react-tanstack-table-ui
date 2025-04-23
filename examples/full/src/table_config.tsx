export interface TableConfig {
  rowCount: number;
  columnCount: number;
  features: {
    expandable: boolean;
    selectable: boolean;
    columnGroups: boolean;
    draggable: boolean;
    pinning: boolean;
    filtering: boolean;
    sorting: boolean;
  };
  dataSize: "small" | "big";
  skin: "default" | "mui" | "bleu";
}

export const defaultTableConfig: TableConfig = {
  rowCount: 5,
  columnCount: 4,
  features: {
    expandable: false,
    selectable: false,
    columnGroups: false,
    draggable: true,
    pinning: true,
    filtering: false,
    sorting: false,
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
    case "filtering":
      return "Filter table data by column values";
    case "sorting":
      return "Sort table by clicking column headers";
    case "pinning":
      return "Pin columns to the left or right";
    default:
      return "";
  }
}

export function getConfigSummary(config: TableConfig): string {
  const features = Object.entries(config.features)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key)
    .join(", ");

  const skinInfo = `${config.skin === "default" ? "Default" : config.skin === "mui" ? "Material UI" : "Bleu"} skin`;
  const dataInfo = config.dataSize === "big" ? "Large dataset" : `${config.rowCount} rows, ${config.columnCount} columns`;
  
  return `${dataInfo} with ${skinInfo}${features ? ` and ${features}` : ""}`;
}
