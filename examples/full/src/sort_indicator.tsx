// Sort indicator component with improved styling
export const SortIndicator = ({
  sorted,
}: {
  sorted: false | "asc" | "desc";
}) => {
  if (!sorted) return null;
  return (
    <span
      style={{ marginLeft: "8px", fontSize: "14px", display: "inline-block" }}
    >
      {sorted === "asc" ? " 🔼" : " 🔽"}
    </span>
  );
};
