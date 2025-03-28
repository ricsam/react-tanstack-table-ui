import {
  TableConfig,
  getFeatureDescription,
  getConfigSummary,
} from "./table_config";

export const TableConfigPanel = ({
  config,
  onChange,
}: {
  config: TableConfig;
  onChange: (newConfig: TableConfig) => void;
}) => {
  const handleFeatureChange = (
    feature: keyof TableConfig["features"],
    value: boolean,
  ) => {
    onChange({
      ...config,
      features: {
        ...config.features,
        [feature]: value,
      },
    });
  };

  const configsWithFeatureNames = [
    { key: "expandable", name: "Expandable Rows" },
    { key: "selectable", name: "Row Selection" },
    { key: "columnGroups", name: "Column Groups" },
    { key: "draggable", name: "Draggable Rows" },
  ] as const;

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
        maxWidth: "1200px",
        margin: "0 auto 20px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Table Configuration</h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            minWidth: "180px",
            backgroundColor: "#fff",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Data Size</h3>
          <select
            value={config.dataSize}
            onChange={(e) =>
              onChange({
                ...config,
                dataSize: e.target.value as "small" | "big",
              })
            }
            style={{ width: "100%", padding: "5px" }}
          >
            <option value="small">Small Dataset</option>
            <option value="big">Large Dataset</option>
          </select>
        </div>

        <div
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            minWidth: "180px",
            backgroundColor: "#fff",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Table Skin</h3>
          <select
            value={config.skin}
            onChange={(e) =>
              onChange({
                ...config,
                skin: e.target.value as "default" | "mui",
              })
            }
            style={{ width: "100%", padding: "5px" }}
          >
            <option value="default">Default Skin</option>
            <option value="mui">Material UI Skin</option>
          </select>
        </div>

        {config.dataSize === "small" && (
          <>
            <div
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                minWidth: "180px",
                backgroundColor: "#fff",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
                Row Count
              </h3>
              <input
                type="range"
                min="2"
                max="50"
                value={config.rowCount}
                onChange={(e) =>
                  onChange({ ...config, rowCount: Number(e.target.value) })
                }
                style={{ width: "100%" }}
              />
              <div style={{ textAlign: "center", marginTop: "5px" }}>
                {config.rowCount} rows
              </div>
            </div>

            <div
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                minWidth: "180px",
                backgroundColor: "#fff",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
                Column Count
              </h3>
              <input
                type="range"
                min="3"
                max="15"
                value={config.columnCount}
                onChange={(e) =>
                  onChange({ ...config, columnCount: Number(e.target.value) })
                }
                style={{ width: "100%" }}
              />
              <div style={{ textAlign: "center", marginTop: "5px" }}>
                {config.columnCount} columns
              </div>
            </div>
          </>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "center",
        }}
      >
        {configsWithFeatureNames.map(({ key, name }) => (
          <div
            key={key}
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: config.features[key] ? "#e6f7ff" : "#fff",
              minWidth: "150px",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => handleFeatureChange(key, !config.features[key])}
          >
            <div
              style={{
                marginBottom: "8px",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={config.features[key]}
                readOnly
                // onChange={(e) => handleFeatureChange(key, e.target.checked)}
                id={`feature-${key}`}
              />
              <label
                htmlFor={`feature-${key}`}
                style={{ marginLeft: "8px", fontWeight: "bold" }}
              >
                {name}
              </label>
            </div>
            <div
              style={{ fontSize: "12px", color: "#666", userSelect: "none" }}
            >
              {getFeatureDescription(key)}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "20px",
          textAlign: "center",
          fontSize: "14px",
          color: "#666",
        }}
      >
        Current configuration: {getConfigSummary(config)}
      </div>
    </div>
  );
};
